import { combinedDisposable, Disposable, DisposableMap, DisposableStore, IDisposable, toDisposable } from './lifecycle.js';

/* An event with zero or one parameters that can be subscribed to. The event is a function itself. */
export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
} //end interface Event

export namespace Event {
} // end namespace Event
