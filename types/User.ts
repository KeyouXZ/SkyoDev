import { Role, RoleKey } from './roles';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
  role: number; // Bitwise integer
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSessionData {
  id: string;
  email: string;
  role: number; // Bitwise integer
  name?: string | null;
  profileImageUrl?: string | null;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  profileImageUrl: string | null;
  role: number;
  roles: RoleKey[];
  subscriptionStatus: string | null;
  phoneNumber: string | null;
  createdAt: Date;
}

export { Role };
