export interface PushSubscribeRequest {
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: string;
}

export interface PushUnsubscribeRequest {
  endpoint: string;
}
