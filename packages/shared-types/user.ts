import type { IsoDatetimeString } from './json';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DISABLED = 'disabled',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWire {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  created_at: IsoDatetimeString;
  updated_at: IsoDatetimeString;
}

export interface AuthenticatedUser extends User {
  tenantId?: string;
}

export interface AuthenticatedUserWire extends UserWire {
  tenant_id?: string;
}

export interface UserSession {
  accessToken: string;
  expiresAt: Date;
  user: AuthenticatedUser;
}

export interface UserSessionWire {
  access_token: string;
  expires_at: IsoDatetimeString;
  user: AuthenticatedUserWire;
}
