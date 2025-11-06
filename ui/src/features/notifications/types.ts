export interface SubscribeRequest {
  endpoint: string;
  expirationTime: number | null;
  keys?: Keys;
}

export interface Keys {
  p256dh: string;
  auth: string;
}