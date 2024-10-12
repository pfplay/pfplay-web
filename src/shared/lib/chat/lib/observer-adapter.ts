import Observer from './observer';
import { ChatMessageListener, ChatObserverEvent } from '../model/chat-message-listener.model';

export default class ObserverAdapter<Message> implements ChatMessageListener<Message> {
  public constructor(private observer: Observer<ChatObserverEvent<Message>>) {}

  public register(listener: (message: Message) => void): void {
    this.observer.subscribe((event: ChatObserverEvent<Message>) => {
      listener(event.message);
    });
  }

  public deregister(listener: (message: Message) => void): void {
    this.observer.unsubscribe((event: ChatObserverEvent<Message>) => {
      listener(event.message);
    });
  }

  public deregisterAll(): void {
    this.observer.unsubscribeAll();
  }

  public notify(event: ChatObserverEvent<Message>): void {
    this.observer.notify(event);
  }
}
