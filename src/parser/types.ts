export interface ParserError<T extends string> {
  type: T,
  error: {
    offset: number;
    expected: string | RegExp,
    got: string
  }
}

export interface ParserSuccess<T extends string> {
  type: T,
  text: string,
  children?: ParserResult<T>[],
  recoverableErrors?: ParserError<T>[],
}

export type ParserResult<T extends string> = ParserSuccess<T> | ParserError<T>;
export type Parse<T extends string> = (text: string) => ParserResult<T>;

type _NodeTypes<T> = T extends Parse<infer U> ? U : never;
export type NodeTypes<T> = _NodeTypes<T>|'error';

export function isParserError<T extends string>(result: ParserResult<T>): result is ParserError<T> {
  return 'error' in result && result.error !== undefined;
}

export function isParserSuccess<T extends string>(result: ParserResult<T>): result is ParserSuccess<T> {
  return 'text' in result && result.text !== undefined;
}