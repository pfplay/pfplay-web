import { Client } from '@stomp/stompjs';
import { StompSubscription } from '@stomp/stompjs/src/stomp-subscription';
import { messageCallbackType } from '@stomp/stompjs/src/types';
import { specificLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';

const logger = withDebugger(0);
const log = logger(specificLog);

export default class StompClient {
  private client: Client;
  private connectListeners: (() => void)[] = [];
  private subscriptions: StompSubscription[] = [];

  public constructor() {
    this.client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_API_WS_HOST_NAME as string,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: log,
    });
  }

  public connect() {
    if (!this.connected) {
      this.client.onConnect = () => {
        this.connectListeners.forEach((listener) => listener());
        this.connectListeners = [];
      };

      this.client.activate();
    }
  }

  public async disconnect() {
    if (this.connected) {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());

      await this.client.deactivate();
    }
  }

  public registerConnectListener(listener: () => void) {
    if (this.connected) {
      listener();
    } else {
      this.connectListeners.push(listener);
    }
  }

  public subscribe(destination: string, callback: messageCallbackType) {
    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.push(subscription);
  }

  public unsubscribe(destination: string) {
    this.client.unsubscribe(destination);
  }

  public unsubscribeAll() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  public send(destination: string, body: Record<string, unknown>) {
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  public get connected() {
    return this.client.connected;
  }

  public get hasSubscription() {
    return this.subscriptions.length > 0;
  }
}