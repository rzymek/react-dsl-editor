import { type Parse, type ParserResult } from './types.ts';
import { trimEmptyNode } from './ast/trimEmptyNode.ts';

export class Parser<T extends string> {
  private readonly parser: Parse<T>;

  constructor(parser: Parse<T>) {
    this.parser = parser;
  }

  public parse(input: string): ParserResult<T> {
    const result = this.parser(input);
    const normalized = [
      trimEmptyNode,
      // <T>(it:T)=>it,
    ].reduce((ast, fn) => fn(ast), result);
    return normalized;
  }
}