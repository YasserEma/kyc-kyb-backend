export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: string;
  subscriberId: string;
  iat?: number;
  exp?: number;
}

export interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
}