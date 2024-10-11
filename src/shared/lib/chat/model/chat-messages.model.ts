export interface ChatMessages<Message> {
  list: Message[];
  append(message: Message): void;
  clear(): void;
  update(
    predicate: (message: Message) => boolean,
    updater: (message: Message) => Message
  ): Message | undefined;
}
