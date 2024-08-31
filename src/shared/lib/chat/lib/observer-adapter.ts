import Observer from './observer';
import type { ChatMessageListener } from '../model/chat-message-listener.model';

export default class ObserverAdapter<Message> implements ChatMessageListener<Message> {
  public constructor(private observer: Observer<Message>) {}

  public register(listener: (message: Message) => void): void {
    this.observer.subscribe(listener);
  }

  public deregister(listener: (message: Message) => void): void {
    this.observer.unsubscribe(listener);
  }

  public deregisterAll(): void {
    this.observer.unsubscribeAll();
  }

  public notify(message: Message): void {
    this.observer.notify(message);
  }
}
