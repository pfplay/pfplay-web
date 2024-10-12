export type ChatObserverEvent<Message> = { type: 'add' | 'update'; message: Message };

export interface ChatMessageListener<Message> {
  register(listener: (message: Message) => void): void;
  deregister(listener: (message: Message) => void): void;
  deregisterAll(): void;
  notify(message: ChatObserverEvent<Message>): void;
}
