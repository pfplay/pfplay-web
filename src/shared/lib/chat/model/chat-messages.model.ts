export interface ChatMessages<Message> {
  list: Message[];
  append(message: Message): void;
}
