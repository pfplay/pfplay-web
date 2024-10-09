import Observer, { ObserverChatEvent } from './observer';
import type { ChatMessageListener } from '../model/chat-message-listener.model';

export default class ObserverAdapter<Message> implements ChatMessageListener<Message> {
  public constructor(private observer: Observer<Message>) {}

  public register(listener: (message: Message) => void): void {
    this.observer.subscribe((event: ObserverChatEvent<Message>) => {
      listener(event.message);
    });
  }

  public deregister(listener: (message: Message) => void): void {
    this.observer.unsubscribe((event: ObserverChatEvent<Message>) => {
      listener(event.message);
    });
  }

  public deregisterAll(): void {
    this.observer.unsubscribeAll();
  }

  public notifyAppend(message: Message): void {
    this.observer.notify({ type: 'add', message });
  }

  public notifyUpdate(message: Message): void {
    this.observer.notify({ type: 'update', message });
  }
}
