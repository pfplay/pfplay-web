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
      new CircularBufferAdapter(new CircularBuffer<Message>(initialMessages, 500)), // 최대 메세지 개수 500개로 제한
      new ObserverAdapter(new Observer<Message>())
    );
  }

  public appendMessage(message: Message): void {
    this.messages.append(message);
    this.messageListener.notifyAppend(message);
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
    const updatedMessages: Message[] = [];

    this.messages.update(predicate, (message: Message) => {
      const updatedMessage = updater(message);
      updatedMessages.push(updatedMessage);
      return updatedMessage;
    });

    // 업데이트된 메시지들에 대해 리스너들에게 알림
    this.notifyMessageUpdates(updatedMessages);
  }

  private notifyMessageUpdates(updatedMessages: Message[]): void {
    updatedMessages.forEach((message) => {
      this.messageListener.notifyUpdate(message);
    });
  }

  public clear(): void {
    this.messages.clear();
    this.messageListener.deregisterAll();
  }
}
