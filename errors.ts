export interface ErrorListenerCallback {
	(error: any): void;
}

export interface ErrorListenerUnbind {
	(): void;
}

// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
export class ErrorHandler {
  	private unexpectedErrorHandler: (e: any) => void;
	  private listeners: ErrorListenerCallback[];

    constructor() {
      this.listeners = [];

      this.unexpectedErrorHandler = function (e: any) {
			  setTimeout(() => {
				  if (e.stack) {
            throw new Error(e.message + '\n\n' + e.stack);
          }
        }, 0);
      };
    } //end constructor
} //end class ErrorHandler
