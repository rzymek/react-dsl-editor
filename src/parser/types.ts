import { isEmpty } from 'remeda';

export interface ParserError<T> {
  offset: number;
  expected: string | RegExp,
  got: string,
  type: T,
}

export interface ParserResult<T extends string> {
  type: T,
  text: string,
  children?: ParserResult<T>[],
  errors: ParserError<T>[]
}

export type Parse<T extends string> = (text: string) => ParserResult<T>;

type _NodeTypes<T> = T extends Parse<infer U> ? U : never;
export type NodeTypes<T> = _NodeTypes<T> | 'error';

export function isParserError<T extends string>(result: ParserResult<T>) {
  return !isEmpty(result.errors);
}

export function isParserSuccess<T extends string>(result: ParserResult<T>) {
  return !isEmpty(result.text);
}