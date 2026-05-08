export type UserRole = 'user' | 'admin' | 'kitchen';
export type PlanStatus = 'none' | 'pending' | 'active' | 'expired';
export type OrderStatus = 'pending' | 'preparing' | 'out-for-delivery' | 'delivered';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  planId?: string;
  planStatus: PlanStatus;
  daysRemaining: number;
  proteinGoal: number;
  avgProtein: number;
  createdAt: any;
  updatedAt: any;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Bowl' | 'Smoothie' | 'Shake' | 'Wrap' | 'Sub' | 'Oats';
  protein: number;
  calories: number;
  price: number;
  isTrialFixed: boolean;
  image?: string;
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'trial' | 'pro';
  price: number;
  duration: number;
  description: string;
  includes: string[];
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  items: MenuItem[];
  status: OrderStatus;
  createdAt: any;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  status: PaymentStatus;
  createdAt: any;
}
