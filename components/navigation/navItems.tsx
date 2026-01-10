import { Plus, Activity, Calendar, LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    href: '/',
    label: 'New Session',
    icon: Plus,
  },
  {
    href: '/activities',
    label: 'Manage Activities',
    icon: Activity,
  },
  {
    href: '/history',
    label: 'Session History',
    icon: Calendar,
  },
];
