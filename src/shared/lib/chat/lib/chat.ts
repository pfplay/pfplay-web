import CircularBuffer from './circular-buffer';
import CircularBufferAdapter from './circular-buffer-adapter';
import Observer from './observer';
import ObserverAdapter from './observer-adapter';
import type { ChatMessageListener } from '../model/chat-message-listener.model';
import type { ChatMessages } from '../model/chat-messages.model';

export default class Chat<Message> {
  private constructor(
    private messages: ChatMessages<Message>,
    private messageListener: ChatMessageListener<Message>
  ) {}

  public static create<Message>(initialMessages: Message[]): Chat<Message> {
    return new Chat(
      new CircularBufferAdapter(new CircularBuffer<Message>(initialMessages, 1000)),
      new ObserverAdapter(new Observer<Message>())
    );
  }

  public appendMessage(message: Message): void {
    this.messages.append(message);
    this.messageListener.notify(message);
  }

  public getMessages(): Message[] {
    return this.messages.list;
  }

  public addMessageListener(listener: (message: Message) => void): void {
    this.messageListener.register(listener);
  }

  public removeMessageListener(listener: (message: Message) => void): void {
    this.messageListener.deregister(listener);
  }
}
