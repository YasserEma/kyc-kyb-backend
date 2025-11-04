import { UserRole } from 'src/modules/user/enums/user-role.enum';

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  subscriberId: number;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}
