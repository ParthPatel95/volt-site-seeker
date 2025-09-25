
import React, { ReactNode } from 'react';
import { TestRunner } from "@/components/TestRunner";
import ComprehensiveFeaturesTest from './pages/ComprehensiveFeaturesTest';

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
  }
];
