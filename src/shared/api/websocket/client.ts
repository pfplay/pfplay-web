import { Client } from '@stomp/stompjs';
import { messageCallbackType } from '@stomp/stompjs/src/types';
import { specificLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';

const logger = withDebugger(0);
const log = logger(specificLog);

export default class StompClient {
  private client: Client;

  public constructor() {
    this.client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_API_WS_HOST_NAME,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  public get connected() {
    return this.client.connected;
  }

  public connect() {
    if (!this.connected) {
      log(`[WS] connecting ...`);

      this.client.onConnect = () => {
        log(`[WS] connected`);
      };

      this.client.activate();
    }
  }

  public async disconnect() {
    if (this.connected) {
      log(`[WS] disconnecting ...`);

      await this.client.deactivate();

      log(`[WS] disconnected`);
    }
  }

  public subscribe(destination: string, callback: messageCallbackType) {
    log(`[WS] subscribe - ${destination}`);

    return this.client.subscribe(destination, callback);
  }

  public send(destination: string, body: Record<string, unknown>) {
    log(`[WS] send to "${destination}"`, body);

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}
