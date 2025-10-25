export interface IUser {
  id: number;
  email: string;
  password?: string;
  isVerified: boolean;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
}
