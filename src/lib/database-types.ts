import { ObjectId } from 'mongodb';

// Base User type (stored in 'users' collection)
export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'cardholder' | 'distributor' | 'admin';
  createdAt: Date;
}

// Cardholder details (stored in 'cardholders' collection)
export interface Cardholder {
  _id: ObjectId;
  userId: ObjectId; // Reference to User._id
  name: string;
  email: string;
  cardNumber: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  entitlements: {
    rice: number; // kg per month
    wheat: number; // kg per month
    sugar: number; // kg per month
  };
  createdAt: Date;
  updatedAt?: Date;
}

// Distributor details (stored in 'distributors' collection)
export interface Distributor {
  _id: ObjectId;
  userId: ObjectId; // Reference to User._id
  ownerName: string;
  email: string;
  shopName: string;
  licenseNumber: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number; // 0-5
  totalOrders: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Token booking (stored in 'tokens' collection)
export interface Token {
  _id: ObjectId;
  tokenNumber: string; // Unique token identifier
  cardholderId: ObjectId;
  cardholderName: string;
  cardholderEmail: string;
  cardholderPhone: string;
  cardNumber: string;
  distributorId: ObjectId;
  distributorName: string;
  distributorAddress: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
  }[];
  collectionDate: Date;
  bookingDate: Date;
  status: 'booked' | 'collected' | 'cancelled';
  distributionDate?: Date;
  distributedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Distribution record (stored in 'distributions' collection)
export interface Distribution {
  _id: ObjectId;
  tokenNumber: string;
  cardholderId: ObjectId;
  cardholderName: string;
  cardholderEmail: string;
  cardholderPhone: string;
  distributorId: ObjectId;
  distributorName: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
  }[];
  distributionDate: Date;
  createdAt: Date;
}

// Distribution Cycle (stored in 'distributionCycles' collection)
export interface DistributionCycle {
  _id: ObjectId;
  distributorId: ObjectId;
  distributorName: string;
  cycleStartDate: Date;
  announcementDate: Date;
  description?: string;
  status: 'announced' | 'ongoing' | 'completed';
  notificationsSent: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Order type (for future use)
export interface Order {
  _id: ObjectId;
  cardholderId: ObjectId;
  distributorId: ObjectId;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  orderDate: Date;
  completionDate?: Date;
}

// Token payload type
export interface TokenPayload {
  userId: string;
  email: string;
  role: 'cardholder' | 'distributor' | 'admin';
}
