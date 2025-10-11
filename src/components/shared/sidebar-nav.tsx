
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarCheck2,
  Map,
  MessageSquareWarning,
  Box,
  ClipboardList,
  Clock,
  User,
} from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { buttonVariants } from '../ui/button';

const userNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
  { href: '/order', label: 'Order Rations', icon: ShoppingCart, tooltip: 'Order Rations' },
  { href: '/book-token', label: 'Book Token', icon: CalendarCheck2, tooltip: 'Book Token' },
  { href: '/find-fps', label: 'Find FPS', icon: Map, tooltip: 'Find FPS' },
  { href: '/complaints', label: 'My Complaints', icon: MessageSquareWarning, tooltip: 'My Complaints' },
  { href: '/profile', label: 'Profile', icon: User, tooltip: 'User Profile' },
];

const distributorNavItems: NavItem[] = [
  { href: '/distributor', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
  { href: '/distributor/stock', label: 'Stock Mgmt', icon: Box, tooltip: 'Stock Management' },
  { href: '/distributor/orders', label: 'Fulfilled Orders', icon: ClipboardList, tooltip: 'Fulfilled Orders' },
  { href: '/distributor/slots', label: 'Distribution Slots', icon: Clock, tooltip: 'Distribution Slots' },
  { href: '/distributor/profile', label: 'Profile', icon: User, tooltip: 'Distributor Profile' },
];

export default function SidebarNav({ role }: { role: 'user' | 'distributor' }) {
  const pathname = usePathname();
  const navItems = role === 'user' ? userNavItems : distributorNavItems;

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'default' }),
              'justify-start gap-3',
              isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
