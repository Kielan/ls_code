export interface IMouseEvent {
	readonly browserEvent: MouseEvent;
	readonly leftButton: boolean;
	readonly middleButton: boolean;
	readonly rightButton: boolean;
	readonly buttons: number;
	readonly target: HTMLElement;
	readonly detail: number;
	readonly posx: number;
	readonly posy: number;
	readonly ctrlKey: boolean;
	readonly shiftKey: boolean;
	readonly altKey: boolean;
	readonly metaKey: boolean;
	readonly timestamp: number;
	readonly defaultPrevented: boolean;

	preventDefault(): void;
	stopPropagation(): void;
}

export interface IMouseWheelEvent extends MouseEvent {
	readonly wheelDelta: number;
	readonly wheelDeltaX: number;
	readonly wheelDeltaY: number;

	readonly deltaX: number;
	readonly deltaY: number;
	readonly deltaZ: number;
	readonly deltaMode: number;
}
