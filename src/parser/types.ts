import { ASTNode } from './ASTNode';
import { ParsingError } from './ParsingError';

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

export type Parse<T extends string> = (text: string) => ParserResult<T>;

type _NodeTypes<T> = T extends Parse<infer U> ? U : never;
export type NodeTypes<T> = _NodeTypes<T> | 'error';

export function isParserError<T extends string>(result: ParserResult<T> | ASTNode<T>): result is ParserError<T> {
  return 'expected' in result;
}

export function isParserSuccess<T extends string>(result: ParserResult<T> | ASTNode<T>): result is ParserSuccess<T> {
  return !isParserError(result);
}

export function asException<T extends string>(error: ParserError<T>) {
  return new ParsingError(`[${error.parser.name}: ${error.type}]: Expected ${error.expected.map(it=>`'${it}'`).join(' | ')}, but got '${error.got}' at ${error.offset}`)
}