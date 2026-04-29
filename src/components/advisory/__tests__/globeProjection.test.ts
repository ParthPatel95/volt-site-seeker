import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
  latLngToVec3,
  tourQuaternionFor,
  setLngOffset,
  GLOBE_RADIUS,
} from '../globeProjection';
import { HQ, PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

/**
 * Regression tests: when the tour rotates the globe group to focus a site,
 * that site must end up centered on-camera (facing +Z, with the small
 * downward tilt baked into the tour target). Because Earth + markers share
 * one parent group, applying the tour quaternion to the site's vector tells
 * us exactly where it lands on screen.
 */

const TOUR_TARGET = new THREE.Vector3(0, -0.18, 1).normalize();

const project = (lat: number, lng: number) => {
  const v = latLngToVec3(lat, lng, 1).normalize();
  return v.applyQuaternion(tourQuaternionFor(lat, lng));
};

describe('globeProjection', () => {
  beforeEach(() => {
    // Pin offset so tests are deterministic and independent of texture calibration.
    setLngOffset(0);
  });

  it('produces unit vectors on a unit sphere', () => {
    const v = latLngToVec3(45, 90, 1);
    expect(v.length()).toBeCloseTo(1, 6);
  });

  it('scales with radius', () => {
    const v = latLngToVec3(45, 90, GLOBE_RADIUS);
    expect(v.length()).toBeCloseTo(GLOBE_RADIUS, 6);
  });

  it('centers Calgary HQ when its tour stop is applied', () => {
    const landed = project(HQ.lat, HQ.lng);
    expect(landed.x).toBeCloseTo(TOUR_TARGET.x, 5);
    expect(landed.y).toBeCloseTo(TOUR_TARGET.y, 5);
    expect(landed.z).toBeCloseTo(TOUR_TARGET.z, 5);
  });

  it('centers Texas when its tour stop is applied', () => {
    const texas = PIPELINE_PROJECTS.find(p => p.id === 'usa-texas')!;
    const landed = project(texas.lat, texas.lng);
    expect(landed.x).toBeCloseTo(TOUR_TARGET.x, 5);
    expect(landed.y).toBeCloseTo(TOUR_TARGET.y, 5);
    expect(landed.z).toBeCloseTo(TOUR_TARGET.z, 5);
  });

  it('centers Newfoundland when its tour stop is applied', () => {
    const nfld = PIPELINE_PROJECTS.find(p => p.id === 'canada-newfoundland')!;
    const landed = project(nfld.lat, nfld.lng);
    expect(landed.x).toBeCloseTo(TOUR_TARGET.x, 5);
    expect(landed.y).toBeCloseTo(TOUR_TARGET.y, 5);
    expect(landed.z).toBeCloseTo(TOUR_TARGET.z, 5);
  });

  it('places every pipeline site on-camera at its own tour stop', () => {
    for (const p of PIPELINE_PROJECTS) {
      const landed = project(p.lat, p.lng);
      expect(landed.distanceTo(TOUR_TARGET)).toBeLessThan(1e-4);
    }
  });

  it('keeps marker vectors locked to the texture under arbitrary rotation', () => {
    // Simulate the tour: rotating the parent group must move the surface point
    // and the marker by the exact same amount (rigid body invariant).
    const q = tourQuaternionFor(HQ.lat, HQ.lng);
    const surfacePoint = latLngToVec3(HQ.lat, HQ.lng, GLOBE_RADIUS);
    const markerPoint  = latLngToVec3(HQ.lat, HQ.lng, GLOBE_RADIUS * 1.025);
    const rotatedSurface = surfacePoint.clone().applyQuaternion(q);
    const rotatedMarker  = markerPoint.clone().applyQuaternion(q);
    // Marker must stay radially above the same surface point after rotation.
    const radialAlignment = rotatedSurface.clone().normalize()
      .dot(rotatedMarker.clone().normalize());
    expect(radialAlignment).toBeCloseTo(1, 6);
  });
});