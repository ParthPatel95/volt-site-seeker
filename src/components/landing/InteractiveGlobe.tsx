import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CountryMarker {
  country: string;
  flag: string;
  lat: number;
  lng: number;
  mw: number;
  type: string;
}

const countries: CountryMarker[] = [
  { country: 'Canada', flag: '🇨🇦', lat: 56.1304, lng: -106.3468, mw: 333, type: 'Hybrid' },
  { country: 'USA', flag: '🇺🇸', lat: 37.0902, lng: -95.7129, mw: 536, type: 'Mix+Natgas' },
  { country: 'Uganda', flag: '🇺🇬', lat: 1.3733, lng: 32.2903, mw: 400, type: 'Hydro' },
  { country: 'Nepal', flag: '🇳🇵', lat: 28.3949, lng: 84.1240, mw: 75, type: 'Mix' },
  { country: 'Bhutan', flag: '🇧🇹', lat: 27.5142, lng: 90.4336, mw: 175, type: 'Hydro' },
  { country: 'India', flag: '🇮🇳', lat: 20.5937, lng: 78.9629, mw: 45, type: 'Solar+Hydro' }
];

// Convert lat/lng to 3D sphere coordinates
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Earth Globe Component
const Earth: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001; // Slow auto-rotation
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial
        color="#0A1628"
        emissive="#0A1628"
        emissiveIntensity={0.2}
        shininess={10}
        wireframe={false}
      />
      {/* Grid overlay for institutional look */}
      <mesh>
        <sphereGeometry args={[2.01, 32, 32]} />
        <meshBasicMaterial
          color="#FFFFFF"
          wireframe={true}
          transparent={true}
          opacity={0.1}
        />
      </mesh>
    </mesh>
  );
};

// Country Marker Component
interface MarkerProps {
  country: CountryMarker;
  onHover: (country: CountryMarker | null) => void;
  isHovered: boolean;
}

const Marker: React.FC<MarkerProps> = ({ country, onHover, isHovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = latLngToVector3(country.lat, country.lng, 2.05);
  
  // Scale marker size based on MW capacity (min 0.05, max 0.15)
  const baseSize = 0.05 + (country.mw / 536) * 0.1;
  const size = isHovered ? baseSize * 1.5 : baseSize;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(size * pulse);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => onHover(country)}
      onPointerOut={() => onHover(null)}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color="#F7931A"
        transparent={true}
        opacity={0.9}
      />
      {/* Glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#F7931A"
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      
      {/* Tooltip */}
      {isHovered && (
        <Html
          position={[0, 0.3, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-white text-watt-navy px-4 py-3 rounded-lg shadow-institutional border border-gray-200 min-w-[180px]">
            <div className="text-2xl mb-1">{country.flag}</div>
            <div className="font-bold text-lg mb-1">{country.country}</div>
            <div className="text-sm text-watt-navy/70 mb-1">
              <span className="font-semibold text-watt-bitcoin">{country.mw}MW</span>
            </div>
            <div className="text-xs text-watt-navy/60">{country.type}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Globe Scene Component
const GlobeScene: React.FC<{ activeCountry: string | null; onCountryHover: (country: CountryMarker | null) => void }> = ({ 
  activeCountry, 
  onCountryHover 
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 6);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <Earth />
      
      {countries.map((country) => (
        <Marker
          key={country.country}
          country={country}
          onHover={onCountryHover}
          isHovered={activeCountry === country.country}
        />
      ))}
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        autoRotate={false}
        rotateSpeed={0.5}
      />
    </>
  );
};

// Main Interactive Globe Component
export const InteractiveGlobe: React.FC = () => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryMarker | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <div className="w-full h-full min-h-[600px] md:min-h-[700px] relative">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Globe Canvas */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy shadow-institutional">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <GlobeScene 
              activeCountry={hoveredCountry?.country || selectedCountry} 
              onCountryHover={setHoveredCountry}
            />
          </Canvas>
          
          {/* Instructions overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
              🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Hover markers for details
            </div>
          </div>
        </div>

        {/* Legend Panel */}
        <Card className="lg:w-80 bg-white border-gray-200 shadow-institutional p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-watt-navy mb-2">
              Global Pipeline
            </h3>
            <div className="text-3xl font-bold text-watt-bitcoin">
              1,429<span className="text-lg text-watt-navy/70">MW</span>
            </div>
            <p className="text-sm text-watt-navy/60 mt-1">Across 6 countries</p>
          </div>

          <div className="space-y-3">
            {countries
              .sort((a, b) => b.mw - a.mw)
              .map((country) => (
                <div
                  key={country.country}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedCountry === country.country || hoveredCountry?.country === country.country
                      ? 'border-watt-bitcoin bg-watt-bitcoin/5 shadow-md'
                      : 'border-gray-200 bg-white hover:border-watt-trust hover:shadow-sm'
                  }`}
                  onClick={() => handleCountryClick(country.country)}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{country.flag}</span>
                        <span className="font-semibold text-watt-navy">
                          {country.country}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-watt-bitcoin">
                          {country.mw}
                        </span>
                        <span className="text-sm text-watt-navy/70">MW</span>
                      </div>
                      <Badge className="mt-2 bg-watt-trust/10 text-watt-trust border-none text-xs">
                        {country.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-watt-navy/60 text-center">
              Click any country to focus • Hover for details
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
