type Listener<T> = (data: T) => void;

export default class Observer<T> {
  private listeners: Listener<T>[] = [];

  public subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: Listener<T>) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public notify(data: T) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}
