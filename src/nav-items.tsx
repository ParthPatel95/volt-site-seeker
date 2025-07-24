
import React, { ReactNode } from 'react';
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
  }
];
