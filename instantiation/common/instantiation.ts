export interface ServicesAccessor {
	get<T>(id: ServiceIdentifier<T>): T;
}
/* Identifies a service of type `T`. */
export interface ServiceIdentifier<T> {
	(...args: any[]): void;
	type: T;
}
