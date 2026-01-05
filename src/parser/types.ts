import { ParsingError } from './ParsingError';

export interface ParserContext {
  faultTolerant: boolean;
}

export interface GrammarNode<T extends string= never> {
  type: T;
  suggestions(): string[];
  parse(text: string, context: ParserContext): ParserResult<T>;
  children: GrammarNode<T>[];
}

export interface ParserSuccess<T extends string = never> {
  text: string;
  grammar: GrammarNode<T>,
  children: ParserSuccess<T>[],
}

export interface ParserError<T extends string = never> {
  grammar: GrammarNode<T>
  got: string;
  expected: string[],
}

export type ParserResult<T extends string = never> = ParserSuccess<T> | ParserError<T>;

export function success<T extends string>(param: ParserSuccess<T>) {
  return {
    t: param.grammar.type,
    ...param
  };
}

export function error<T extends string>(param: ParserError<T>) {
  return param;
}

export function isParserError<T extends string>(result: ParserResult<T>): result is ParserError<T> {
  return 'expected' in result;
}

export function isParserSuccess<T extends string>(result: ParserResult<T>): result is ParserSuccess<T> {
  return !isParserError(result);
}

export function asException<T extends string>(error: ParserError<T>) {
  return new ParsingError(`[${error.grammar.type}]: Expected ${error.expected.map(it => `'${it}'`).join(' | ')}, but got '${error.got}'`);
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




*/