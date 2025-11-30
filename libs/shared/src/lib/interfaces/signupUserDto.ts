export interface SignupUserDto {
  hookId: string;
  event: string;
  createdAt: string;
  sessionId: string;
  userAgent: string;
  ip: string;
  userIp: string;
  userId: string;
  user: {
    id: string;
    username: string;
    primaryEmail?: string;
    primaryPhone?: string;
    name?: string;
    avatar?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customData?: Record<string, any>;
    identities?: {
      google: {
        userId: string;
      };
    };
    profile: Record<string, unknown>;
    applicationId: string;
    isSuspended: boolean;
    lastSignInAt: number;
    createdAt: number;
    updatedAt: number;
  };
  data: {
    id: string;
    username: string;
    primaryEmail?: string;
    primaryPhone?: string;
    name?: string;
    avatar?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customData?: Record<string, any>;
    identities?: {
      google: {
        userId: string;
      };
    };
    profile: Record<string, unknown>;
    applicationId: string;
    isSuspended: boolean;
    lastSignInAt: number;
    createdAt: number;
    updatedAt: number;
  };
  application: {
    id: string;
    type: string;
    name: string;
    description: string;
  };
}
