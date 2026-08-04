export interface SubscribeRequest {
  endpoint: string;
  expirationTime: number | null;
  keys?: Keys;
}

export interface Keys {
  p256dh: string;
  auth: string;
}

export interface Notifications {
  id?: string;
  _id?: string;
  title: string;
  message: string;
  time: number;
  targetType?: 'all' | 'user' | 'team';
  targetId?: string;
  targetName?: string;
  read?: boolean;
}