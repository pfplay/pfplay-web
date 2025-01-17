export class EventEmitter<Event = string> {
  private events = new Map<Event, (() => void)[]>();

  public on(event: Event, callback: () => void) {
    const callbacks = this.events.get(event) ?? [];
    callbacks.push(callback);
    this.events.set(event, callbacks);
  }

  public off(event: Event, callback: () => void) {
    const callbacks = this.events.get(event) ?? [];
    const index = callbacks.indexOf(callback);
    if (index >= 0) {
      callbacks.splice(index, 1);
    }
  }

  public emit(event: Event) {
    const callbacks = this.events.get(event) ?? [];
    callbacks.forEach((callback) => callback());
  }
}
