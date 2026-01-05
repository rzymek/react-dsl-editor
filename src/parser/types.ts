export interface ParserContext<T,C> {
  faultTolerant: boolean;
}

export interface GrammarNode<T, C> {
  type: T | C;

  suggestions(): string[];

  parse(text: string, context: ParserContext<T, C>): ParserResult<T, C>;
}

export interface ParserSuccess<T, C> {
  text: string;
  grammar: GrammarNode<T, C>
}

export interface ParserError<T, C> {
  grammar: GrammarNode<T, C>
  got: string;
  expected: string[],
}

export type ParserResult<T, C> = ParserSuccess<T, C> | ParserError<T, C>;

export function success<T, C>(param: ParserSuccess<T, C>) {
  return param;
}

export function error<T, C>(param: ParserError<T, C>) {
  return param;
}

export function isParserError<T,C>(result: ParserResult<T,C>): result is ParserError<T,C> {
  return 'expected' in result;
}

export function isParserSuccess<T,C>(result: ParserResult<T,C>): result is ParserSuccess<T,C> {
  return !isParserError(result);
}

/*
export interface ParserError<T extends string> {
  offset: number;
  expected: string[],
  got: string,
  type: T,
  parser: Parse<T>,
}

export interface ParserSuccess<T extends string> {
  type: T,
  text: string,
  parser: Parse<T>,
  children?: ParserSuccess<T>[],
}

export type ParserResult<T extends string> = ParserSuccess<T> | ParserError<T>;

export type Parse<T extends string> = ((text: string) => ParserResult<T>) & ({
  type: string,
  suggestions: ()=>string[],
});

type _NodeTypes<T> = T extends Parse<infer U> ? U : never;
export type NodeTypes<T> = _NodeTypes<T> | 'error';



export function asException<T extends string>(error: ParserError<T>) {
  return new ParsingError(`[${error.parser.name}: ${error.type}]: Expected ${error.expected.map(it => `'${it}'`).join(' | ')}, but got '${error.got}' at ${error.offset}`)
}
*/