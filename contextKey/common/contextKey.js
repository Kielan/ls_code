import { Event } from '../../event.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { IDisposable } from '../../lifecycle.js';

export type ContextKeyValue = null | undefined | boolean | number | string
	| Array<null | undefined | boolean | number | string>
	| Record<string, null | undefined | boolean | number | string>;

export interface IContextKey<T extends ContextKeyValue = ContextKeyValue> {
	set(value: T): void;
	reset(): void;
	get(): T | undefined;
}

export const IContextKeyService = createDecorator<IContextKeyService>('contextKeyService');

export interface IReadableSet<T> {
	has(value: T): boolean;
}

export interface IContextKeyChangeEvent {
	affectsSome(keys: IReadableSet<string>): boolean;
	allKeysContainedIn(keys: IReadableSet<string>): boolean;
}

export type IScopedContextKeyService = IContextKeyService & IDisposable;

export interface IContextKeyService {
	readonly _serviceBrand: undefined;

	readonly onDidChangeContext: Event<IContextKeyChangeEvent>;
	bufferChangeEvents(callback: Function): void;

	createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
	contextMatchesRules(rules: ContextKeyExpression | undefined): boolean;
	getContextKeyValue<T>(key: string): T | undefined;

	createScoped(target: IContextKeyServiceTarget): IScopedContextKeyService;
	createOverlay(overlay: Iterable<[string, any]>): IContextKeyService;
	getContext(target: IContextKeyServiceTarget | null): IContext;

	updateParent(parentContextKeyService: IContextKeyService): void;
}
