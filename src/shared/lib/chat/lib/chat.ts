import { MAX_MESSAGE_AMOUNT } from '@/shared/config/max-message-amount';
import CircularBuffer from './circular-buffer';
import CircularBufferAdapter from './circular-buffer-adapter';
import Observer from './observer';
import ObserverAdapter from './observer-adapter';
import type { ChatMessageListener, ChatObserverEvent } from '../model/chat-message-listener.model';
import type { ChatMessages } from '../model/chat-messages.model';

export default class Chat<Message> {
  private constructor(
    private messages: ChatMessages<Message>,
    private messageListener: ChatMessageListener<Message>
  ) {}

  public static create<Message>(initialMessages: Message[]): Chat<Message> {
    return new Chat(
      new CircularBufferAdapter(new CircularBuffer<Message>(initialMessages, MAX_MESSAGE_AMOUNT)),
      new ObserverAdapter(new Observer<ChatObserverEvent<Message>>())
    );
  }

  public appendMessage(message: Message): void {
    this.messages.append(message);
    this.messageListener.notify({ type: 'add', message });
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

  public updateMessage(
    predicate: (message: Message) => boolean,
    updater: (message: Message) => Message
  ): void {
    let updatedMessage: Message | undefined;

    this.messages.update(predicate, (message: Message) => {
      if (!updatedMessage) {
        updatedMessage = updater(message);
        return updatedMessage;
      }
      return message;
    });

    if (updatedMessage) {
      this.messageListener.notify({ type: 'update', message: updatedMessage });
    }
  }

  public clear(): void {
    this.messages.clear();
    this.messageListener.deregisterAll();
  }
}
