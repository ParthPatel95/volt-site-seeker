
import React, { ReactNode } from 'react';
import { TestRunner } from "@/components/TestRunner";
import ComprehensiveFeaturesTest from './pages/ComprehensiveFeaturesTest';
import BackendTests from './pages/BackendTests';
import MinerFleetTest from './pages/MinerFleetTest';

export interface NavItem {
  title: string;
  to: string;
  icon?: ReactNode;
  page: ReactNode;
}

export const navItems: NavItem[] = [
  {
    title: 'Comprehensive Features Test',
    to: '/comprehensive-features-test',
    page: <ComprehensiveFeaturesTest />
  },
  {
    title: 'System Test Runner',
    to: '/system-tests',
    page: <TestRunner />
  },
  {
    title: 'Backend Test Suite',
    to: '/backend-tests',
    page: <BackendTests />
  },
  {
    title: 'Miner Fleet Test Suite',
    to: '/miner-fleet-test',
    page: <MinerFleetTest />
  }
];
