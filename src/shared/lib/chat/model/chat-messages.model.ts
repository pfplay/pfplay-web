export interface ChatMessages<Message> {
  list: Message[];
  append(message: Message): void;
  clear(): void;
}
