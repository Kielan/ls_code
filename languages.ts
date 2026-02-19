export class Token {
  _tokenBrand: void = undefined
  constructor(
    public readonly offset: number,
    public readonly type: string,
    public readonly language: string,
  ) {
  }
  public toString(): string {
    return '('+this.offset+', '+this.type+')';
  }
}

export class TokenizationResult {
  _tokenizationResultBrand: void = undefined;
  constructor(
    public readonly tokens: Token[],
		public readonly endState: IState,
  ) {
  }
}

export interface IFontToken {
  readonly startIndex: number;
	readonly endIndex: number;
	readonly fontFamily: string | null;
	readonly fontSizeMultiplier: number | null;
	readonly lineHeightMultiplier: number | null;
}

export class EncodedTokenizationResult {
	_encodedTokenizationResultBrand: void = undefined;
	constructor(
		/* The tokens in binary format. Each token occupies two array indices. For token i:
		 *  - at offset 2*i => startIndex
		 *  - at offset 2*i + 1 => metadata */
		public readonly tokens: Uint32Array,
		public readonly fontInfo: IFontToken[],
		public readonly endState: IState,
	) {
	}
}

export interface SyntaxNode {
	startIndex: number;
	endIndex: number;
	startPosition: IPosition;
	endPosition: IPosition;
}

export interface QueryCapture {
	name: string;
	text?: string;
	node: SyntaxNode;
	encodedLanguageId: number;
}

export interface ITokenizationSupport {
	/* If true, the background tokenizer will only be used to verify tokens against the default background tokenizer.
	 * Used for debugging. */
	readonly backgroundTokenizerShouldOnlyVerifyTokens?: boolean;
	getInitialState(): IState;
	tokenize(line: string, hasEOL: boolean, state: IState): TokenizationResult;
	tokenizeEncoded(line: string, hasEOL: boolean, state: IState): EncodedTokenizationResult;
	/* Can be/return undefined if default background tokenization should be used. */
	createBackgroundTokenizer?(textModel: model.ITextModel, store: IBackgroundTokenizationStore): IBackgroundTokenizer | undefined;
}

export interface IBackgroundTokenizer extends IDisposable {
	/* Instructs the background tokenizer to set the tokens for the given range again.
	 * This might be necessary if the renderer overwrote those tokens with heuristically computed ones for some viewport,
	 * when the change does not even propagate to that viewport. */
	requestTokens(startLineNumber: number, endLineNumberExclusive: number): void;
	reportMismatchingTokens?(lineNumber: number): void;
}

export interface IBackgroundTokenizationStore {
	setTokens(tokens: ContiguousMultilineTokens[]): void;
	setFontInfo(changes: FontTokensUpdate): void;
	setEndState(lineNumber: number, state: IState): void;
	/* Should be called to indicate that the background tokenization has finished for now.
	 * (This triggers bracket pair colorization to re-parse the bracket pairs with token information) */
	backgroundTokenizationFinished(): void;
}

/* The state of the tokenizer between two lines.
 * It is useful to store flags such as in multiline comment, etc.
 * The model will clone the previous line's state and pass it in to tokenize the next line.*/
export interface IState {
	clone(): IState;
	equals(other: IState): boolean;
}

/* A provider result represents the values a provider, like the {@link HoverProvider},
 * may return. For once this is the actual result type `T`, like `Hover`, or a thenable that resolves
 * to that type `T`. In addition, `null` and `undefined` can be returned - either directly or from a
 * thenable. */
export type ProviderResult<T> = T | undefined | null | Thenable<T | undefined | null>;

/* A hover represents additional information for a symbol or word. Hovers are
 * rendered in a tooltip-like widget. */
export interface Hover {
	/* The contents of this hover. */
	contents: IMarkdownString[];
	/* The range to which this hover applies. When missing, the
	 * editor will use the range at the current position or the
	 * current position itself. */
	range?: IRange;
	/* Can increase the verbosity of the hover */
	canIncreaseVerbosity?: boolean;
	/* Can decrease the verbosity of the hover */
	canDecreaseVerbosity?: boolean;
}

/* The hover provider interface defines the contract between extensions and
 * the [hover](https://code.visualstudio.com/docs/editor/intellisense)-feature. */
export interface HoverProvider<THover = Hover> {
	/* Provide a hover for the given position, context and document. Multiple hovers at the same
	 * position will be merged by the editor. A hover can have a range which defaults
	 * to the word range at the position when omitted. */
	provideHover(model: model.ITextModel, position: Position, token: CancellationToken, context?: HoverContext<THover>): ProviderResult<THover>;
}

export interface HoverContext<THover = Hover> {
	/* Hover verbosity request */
	verbosityRequest?: HoverVerbosityRequest<THover>;
}

export interface HoverVerbosityRequest<THover = Hover> {
	/* The delta by which to increase/decrease the hover verbosity level */
	verbosityDelta: number;
	/* The prev hover for the same position */
	previousHover: THover;
}

export enum HoverVerbosityAction {
	/* Increase the verbosity of the hover */
	Increase,
	/* Decrease the verbosity of the hover */
	Decrease
}

/* An evaluatable expression represents additional information for an expression in a document. Evaluatable expressions are
 * evaluated by a debugger or runtime and their result is rendered in a tooltip-like widget. */
export interface EvaluatableExpression {
	/* The range to which this expression applies. */
	range: IRange;
	/* This expression overrides the expression extracted from the range. */
	expression?: string;
}

/* The evaluatable expression provider interface defines the contract between extensions and
 * the debug hover. */
export interface EvaluatableExpressionProvider {
	/* Provide a hover for the given position and document. Multiple hovers at the same
	 * position will be merged by the editor. A hover can have a range which defaults
	 * to the word range at the position when omitted. */
	provideEvaluatableExpression(model: model.ITextModel, position: Position, token: CancellationToken): ProviderResult<EvaluatableExpression>;
}

/* A value-object that contains contextual information when requesting inline values from a InlineValuesProvider. */
export interface InlineValueContext {
	frameId: number;
	stoppedLocation: Range;
}

/* Provide inline value as text. */
export interface InlineValueText {
	type: 'text';
	range: IRange;
	text: string;
}

/* Provide inline value through a variable lookup. */
export interface InlineValueVariableLookup {
	type: 'variable';
	range: IRange;
	variableName?: string;
	caseSensitiveLookup: boolean;
}

/* Provide inline value through an expression evaluation. */
export interface InlineValueExpression {
	type: 'expression';
	range: IRange;
	expression?: string;
}

/* Inline value information can be provided by different means:
 * - directly as a text value (class InlineValueText).
 * - as a name to use for a variable lookup (class InlineValueVariableLookup)
 * - as an evaluatable expression (class InlineValueEvaluatableExpression)
 * The InlineValue types combines all inline value types into one type.
 * @internal */
export type InlineValue = InlineValueText | InlineValueVariableLookup | InlineValueExpression;

/* The inline values provider interface defines the contract between extensions and
 * the debugger's inline values feature. */
export interface InlineValuesProvider {
	onDidChangeInlineValues?: Event<void> | undefined;
	/* Provide the "inline values" for the given range and document. Multiple hovers at the same
	 * position will be merged by the editor. A hover can have a range which defaults
	 * to the word range at the position when omitted. */
	provideInlineValues(model: model.ITextModel, viewPort: Range, context: InlineValueContext, token: CancellationToken): ProviderResult<InlineValue[]>;
}

export const enum CompletionItemKind {
	Method,
	Function,
	Constructor,
	Field,
	Variable,
	Class,
	Struct,
	Interface,
	Module,
	Property,
	Event,
	Operator,
	Unit,
	Value,
	Constant,
	Enum,
	EnumMember,
	Keyword,
	Text,
	Color,
	File,
	Reference,
	Customcolor,
	Folder,
	TypeParameter,
	User,
	Issue,
	Tool,
	Snippet, // <- highest value (used for compare!)
}

export namespace CompletionItemKinds {
	const byKind = new Map<CompletionItemKind, ThemeIcon>();
	byKind.set(CompletionItemKind.Method, Codicon.symbolMethod);
	byKind.set(CompletionItemKind.Function, Codicon.symbolFunction);
	byKind.set(CompletionItemKind.Constructor, Codicon.symbolConstructor);
	byKind.set(CompletionItemKind.Field, Codicon.symbolField);
	byKind.set(CompletionItemKind.Variable, Codicon.symbolVariable);
	byKind.set(CompletionItemKind.Class, Codicon.symbolClass);
	byKind.set(CompletionItemKind.Struct, Codicon.symbolStruct);
	byKind.set(CompletionItemKind.Interface, Codicon.symbolInterface);
	byKind.set(CompletionItemKind.Module, Codicon.symbolModule);
	byKind.set(CompletionItemKind.Property, Codicon.symbolProperty);
	byKind.set(CompletionItemKind.Event, Codicon.symbolEvent);
	byKind.set(CompletionItemKind.Operator, Codicon.symbolOperator);
	byKind.set(CompletionItemKind.Unit, Codicon.symbolUnit);
	byKind.set(CompletionItemKind.Value, Codicon.symbolValue);
	byKind.set(CompletionItemKind.Enum, Codicon.symbolEnum);
	byKind.set(CompletionItemKind.Constant, Codicon.symbolConstant);
	byKind.set(CompletionItemKind.Enum, Codicon.symbolEnum);
	byKind.set(CompletionItemKind.EnumMember, Codicon.symbolEnumMember);
	byKind.set(CompletionItemKind.Keyword, Codicon.symbolKeyword);
	byKind.set(CompletionItemKind.Snippet, Codicon.symbolSnippet);
	byKind.set(CompletionItemKind.Text, Codicon.symbolText);
	byKind.set(CompletionItemKind.Color, Codicon.symbolColor);
	byKind.set(CompletionItemKind.File, Codicon.symbolFile);
	byKind.set(CompletionItemKind.Reference, Codicon.symbolReference);
	byKind.set(CompletionItemKind.Customcolor, Codicon.symbolCustomColor);
	byKind.set(CompletionItemKind.Folder, Codicon.symbolFolder);
	byKind.set(CompletionItemKind.TypeParameter, Codicon.symbolTypeParameter);
	byKind.set(CompletionItemKind.User, Codicon.account);
	byKind.set(CompletionItemKind.Issue, Codicon.issues);
	byKind.set(CompletionItemKind.Tool, Codicon.tools);

	const data = new Map<string, CompletionItemKind>();
	data.set('method', CompletionItemKind.Method);
	data.set('function', CompletionItemKind.Function);
	data.set('constructor', CompletionItemKind.Constructor);
	data.set('field', CompletionItemKind.Field);
	data.set('variable', CompletionItemKind.Variable);
	data.set('class', CompletionItemKind.Class);
	data.set('struct', CompletionItemKind.Struct);
	data.set('interface', CompletionItemKind.Interface);
	data.set('module', CompletionItemKind.Module);
	data.set('property', CompletionItemKind.Property);
	data.set('event', CompletionItemKind.Event);
	data.set('operator', CompletionItemKind.Operator);
	data.set('unit', CompletionItemKind.Unit);
	data.set('value', CompletionItemKind.Value);
	data.set('constant', CompletionItemKind.Constant);
	data.set('enum', CompletionItemKind.Enum);
	data.set('enum-member', CompletionItemKind.EnumMember);
	data.set('enumMember', CompletionItemKind.EnumMember);
	data.set('keyword', CompletionItemKind.Keyword);
	data.set('snippet', CompletionItemKind.Snippet);
	data.set('text', CompletionItemKind.Text);
	data.set('color', CompletionItemKind.Color);
	data.set('file', CompletionItemKind.File);
	data.set('reference', CompletionItemKind.Reference);
	data.set('customcolor', CompletionItemKind.Customcolor);
	data.set('folder', CompletionItemKind.Folder);
	data.set('type-parameter', CompletionItemKind.TypeParameter);
	data.set('typeParameter', CompletionItemKind.TypeParameter);
	data.set('account', CompletionItemKind.User);
	data.set('issue', CompletionItemKind.Issue);
	data.set('tool', CompletionItemKind.Tool);

	export function fromString(value: string): CompletionItemKind;
	export function fromString(value: string, strict: true): CompletionItemKind | undefined;
	export function fromString(value: string, strict?: boolean): CompletionItemKind | undefined {
		let res = data.get(value);
		if (typeof res === 'undefined' && !strict) {
			res = CompletionItemKind.Property;
		}
		return res;
	}
}

export interface CompletionItemLabel {
	label: string;
	detail?: string;
	description?: string;
}

export const enum CompletionItemTag {
	Deprecated = 1
}

export interface Command {
	id: string;
	title: string;
	tooltip?: string;
	arguments?: unknown[];
}

export namespace Command {
	export function is(obj: unknown): obj is Command {
		if (!obj || typeof obj !== 'object') {
			return false;
		}
		return typeof (<Command>obj).id === 'string' &&
			typeof (<Command>obj).title === 'string';
	}
}
