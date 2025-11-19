export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  subscriberId: string;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}
