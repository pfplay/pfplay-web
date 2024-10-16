type Listener<T> = (data: T) => void;

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

  public notify(event: T) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
