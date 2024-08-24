import CircularBuffer from './circular-buffer';
import type { ChatMessages } from '../model/chat-messages.model';

export default class CircularBufferAdapter<Message> implements ChatMessages<Message> {
  public constructor(private buffer: CircularBuffer<Message>) {}

  public get list(): Message[] {
    return this.buffer.list;
  }

  public append(message: Message): void {
    this.buffer.append(message);
  }
}
