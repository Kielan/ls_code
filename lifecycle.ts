/* Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives. */
const TRACK_DISPOSABLES = false;
let disposableTracker: IDisposableTracker | null = null;

export interface IDisposableTracker {
	/* Is called on construction of a disposable.	*/
	trackDisposable(disposable: IDisposable): void;

	/* Is called when a disposable is registered as child of another disposable (e.g. {@link DisposableStore}).
	 * If parent is `null`, the disposable is removed from its former parent.	*/
	setParent(child: IDisposable, parent: IDisposable | null): void;

	/* Is called after a disposable is disposed.	*/
	markAsDisposed(disposable: IDisposable): void;
	/* Indicates that the given object is a singleton which does not need to be disposed.	*/
	markAsSingleton(disposable: IDisposable): void;
}

export function setDisposableTracker(tracker: IDisposableTracker | null): void {
	disposableTracker = tracker;
}

if (TRACK_DISPOSABLES) {
	const __is_disposable_tracked__ = '__is_disposable_tracked__';
  setDisposableTracker(new class implements IDisposableTracker {
    trackDisposable(x: IDisposable): void {
      const stack = new Error('Potentially leaked disposable').stack!;
			setTimeout(() => {
				// eslint-disable-next-line local/code-no-any-casts
				if (!(x as any)[__is_disposable_tracked__]) {
					console.log(stack);
				}
			}, 3000);//end setTimeout
    } //end trackDisposable()
    
		setParent(child: IDisposable, parent: IDisposable | null): void {
			if (child && child !== Disposable.None) {
				try {
					// eslint-disable-next-line local/code-no-any-casts
					(child as any)[__is_disposable_tracked__] = true;
				} catch {
					// noop
				}
			}
		}
		markAsDisposed(disposable: IDisposable): void {
			if (disposable && disposable !== Disposable.None) {
				try {
					// eslint-disable-next-line local/code-no-any-casts
					(disposable as any)[__is_disposable_tracked__] = true;
				} catch {
					// noop
				}
			}
		}//end markAsDisposed
		markAsSingleton(disposable: IDisposable): void { }
	});//end setDisposableTracker(impl IDisposableTracker{})
} //end if TRACK_DISPOSABLES

/* Indicates that the given object is a singleton which does not need to be disposed.*/
export function markAsSingleton<T extends IDisposable>(singleton: T): T {
	disposableTracker?.markAsSingleton(singleton);
	return singleton;
}
/* An obj that performs a cleanup op when `.dispose()` is called. *
 * Some examples of how disposables are used:
 * - An ev listener that removes itself when `.dispose()` is called.
 * - A rsrc such as a file system watcher that cleans up the rsrc when `.dispose()` is called.
 * - The return val from registering a provider. When `.dispose()` is called, the provider is unregistered. */
export interface IDisposable {
	dispose(): void;
}

function setParentOfDisposables(children: IDisposable[], parent: IDisposable | null): void {
	if (!disposableTracker) {
		return;
	}
	for (const child of children) {
		disposableTracker.setParent(child, parent);
	}
}

/* Combine multiple disposable values into a single {@link IDisposable}. */
export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
	const parent = toDisposable(() => dispose(disposables));
	setParentOfDisposables(disposables, parent);
	return parent;
}

class FunctionDisposable implements IDisposable {
	private _isDisposed: boolean;
	private readonly _fn: () => void;
	constructor(fn: () => void) {
		this._isDisposed = false;
		this._fn = fn;
  }
  dispose() {
		if (this._isDisposed) {
			return;
		}
		if (!this._fn) {
			throw new Error(`Unbound disposable context: Need to use an arrow function to preserve the value of this`);
		}
		this._isDisposed = true;
		markAsDisposed(this);
		this._fn();
	}
}

/* Turn a fn that implements dispose into an {@link IDisposable}.
 * @param fn Clean up fn, guaranteed to be called only **once**. */
export function toDisposable(fn: () => void): IDisposable {
	return new FunctionDisposable(fn);
}

/* Mng a collection of disposable vals.
 * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
 * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
 * store that has already been disposed of. */
export class DisposableStore implements IDisposable {
	static DISABLE_DISPOSED_WARNING = false;
	private readonly _toDispose = new Set<IDisposable>();
	private _isDisposed = false;
	constructor() {
		trackDisposable(this);
	}
	/* Dispose of all registered disposables and mark this object as disposed.
	 * Any future disposables added to this object will be disposed of on `add`. */
	public dispose(): void {
		if (this._isDisposed) {
			return;
		}
		markAsDisposed(this);
		this._isDisposed = true;
		this.clear();
	}
	/* @return `true` if this object has been disposed of. */
	public get isDisposed(): boolean {
		return this._isDisposed;
	}

}

/* Abstract base class for a {@link IDisposable disposable} object.
 * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of. */
export abstract class Disposable implements IDisposable {
	/* A disposable that does nothing when it is disposed of.
	 * TODO: This should not be a static property. */
  static readonly None = Object.freeze<IDisposable>({ dispose() { } });
	protected readonly _store = new DisposableStore();
	constructor() {
		trackDisposable(this);
		setParentOfDisposable(this._store, this);
	}
	public dispose(): void {
		markAsDisposed(this);
		this._store.dispose();
	}
}
