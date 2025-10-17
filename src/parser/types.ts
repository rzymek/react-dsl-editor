import { isEmpty } from 'remeda';

export interface ParserError {
  offset: number;
  expected: string | RegExp,
  got: string
}

export interface ParserResult<T extends string> {
  type: T,
  text: string,
  children?: ParserResult<T>[],
  errors: ParserError[]
}

export type Parse<T extends string> = (text: string) => ParserResult<T>;

type _NodeTypes<T> = T extends Parse<infer U> ? U : never;
export type NodeTypes<T> = _NodeTypes<T>|'error';

export function isParserError<T extends string>(result: ParserResult<T>) {
  return !isEmpty(result.errors);
}

export function isParserSuccess<T extends string>(result: ParserResult<T>) {
  return !isEmpty(result.text);
}