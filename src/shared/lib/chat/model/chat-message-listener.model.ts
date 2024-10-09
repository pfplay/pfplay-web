export interface ChatMessageListener<Message> {
  register(listener: (message: Message) => void): void;
  deregister(listener: (message: Message) => void): void;
  deregisterAll(): void;
  notifyAppend(message: Message): void;
  notifyUpdate(message: Message): void;
}
