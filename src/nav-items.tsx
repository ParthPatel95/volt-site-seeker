
import { ReactNode } from 'react';

export interface NavItem {
  title: string;
  to: string;
  icon?: ReactNode;
  page: ReactNode;
}

export const navItems: NavItem[] = [
  // Add any additional nav items here if needed in the future
  // For now, this is just to prevent the build error
];
