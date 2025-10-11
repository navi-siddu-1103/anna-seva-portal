import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product, FPS, Complaint } from '@/lib/types';

const findImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return {
    imageUrl: image?.imageUrl || '',
    imageHint: image?.imageHint || '',
  };
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Rice (PDS)',
    price: 3,
    unit: 'kg',
    entitlement: '5 kg per person',
    stock: 250,
    ...findImage('rice-bag'),
  },
  {
    id: '2',
    name: 'Wheat Flour (Atta)',
    price: 2,
    unit: 'kg',
    entitlement: '5 kg per person',
    stock: 400,
    ...findImage('wheat-flour'),
  },
  {
    id: '3',
    name: 'Sugar',
    price: 20,
    unit: 'kg',
    entitlement: '1 kg per family',
    stock: 150,
    ...findImage('sugar-pack'),
  },
  {
    id: '4',
    name: 'Toor Dal',
    price: 45,
    unit: 'kg',
    entitlement: '1 kg per family',
    stock: 100,
    ...findImage('dal-lentils'),
  },
  {
    id: '5',
    name: 'Cooking Oil',
    price: 90,
    unit: 'litre',
    entitlement: '1 litre per family',
    stock: 80,
    ...findImage('cooking-oil'),
  },
];

export const fpsLocations: FPS[] = [
  {
    id: 'fps-1',
    name: 'Annapurna Fair Price Shop',
    shopkeeper: 'Ramesh Kumar',
    hours: '9 AM - 6 PM',
    stockStatus: 'Available',
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 'fps-2',
    name: 'Janata Consumer Store',
    shopkeeper: 'Suresh Singh',
    hours: '8 AM - 5 PM',
    stockStatus: 'Limited',
    lat: 12.975,
    lng: 77.61,
  },
  {
    id: 'fps-3',
    name: 'Gramin Seva Kendra',
    shopkeeper: 'Priya Sharma',
    hours: '10 AM - 7 PM',
    stockStatus: 'Available',
    lat: 12.96,
    lng: 77.58,
  },
];

export const userComplaints: Complaint[] = [
    { id: 'C001', subject: 'Incorrect quantity of wheat', date: '2024-07-15', status: 'Resolved' },
    { id: 'C002', subject: 'Shop closed during opening hours', date: '2024-07-28', status: 'Pending' },
];

export const purchaseHistory = {
  '2024-06': ['Rice', 'Wheat Flour', 'Sugar'],
  '2024-05': ['Rice', 'Wheat Flour'],
  '2024-04': ['Rice', 'Wheat Flour', 'Sugar', 'Toor Dal'],
};

export const regionalAvailability = {
    'Karnataka': ['Ragi', 'Jowar', 'Rice'],
    'Default': ['Rice', 'Wheat', 'Sugar', 'Dal', 'Oil']
};
