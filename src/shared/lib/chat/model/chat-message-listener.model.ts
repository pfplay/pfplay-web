export interface ChatMessageListener<Message> {
  register(listener: (message: Message) => void): void;
  deregister(listener: (message: Message) => void): void;
  deregisterAll(): void;
  notify(message: Message): void;
}
