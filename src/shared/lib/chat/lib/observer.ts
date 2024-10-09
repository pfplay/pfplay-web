export type ObserverChatEvent<Message> = { type: 'add' | 'update'; message: Message };

type Listener<T> = (data: ObserverChatEvent<T>) => void;

export default class Observer<T> {
  private listeners: Listener<T>[] = [];

  public subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: Listener<T>) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public unsubscribeAll() {
    this.listeners = [];
  }

  public notify(event: ObserverChatEvent<T>) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
