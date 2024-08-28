export interface ChatMessageListener<Message> {
  register(listener: (message: Message) => void): void;
  deregister(listener: (message: Message) => void): void;
  notify(message: Message): void;
}
