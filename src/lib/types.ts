import type { LucideIcon } from 'lucide-react';

export type UserRole = 'Card Holder' | 'PDS Distributor';

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  entitlement: string;
  stock: number;
  imageUrl: string;
  imageHint: string;
};

export type FPS = {
  id: string;
  name: string;
  shopkeeper: string;
  hours: string;
  stockStatus: 'Available' | 'Limited' | 'Out of Stock';
  lat: number;
  lng: number;
};

export type Complaint = {
  id: string;
  subject: string;
  date: string;
  status: 'Pending' | 'Resolved';
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tooltip: string;
};
