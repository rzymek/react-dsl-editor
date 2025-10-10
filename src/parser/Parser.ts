import type { Parse } from './types.ts';
import { trimEmptyNode } from './ast/trimEmptyNode.ts';
import { ParsingError } from './ParsingError.ts';

export class Parser {
  private readonly parser: Parse;

  constructor(parser: Parse) {
    this.parser = parser;
  }

  public parse(input: string) {
    const result = this.parser(input);
    if ('error' in result) {
      console.log(result);
      throw new ParsingError(result.error);
    }
    return [trimEmptyNode]
      .reduce((ast, fn) => fn(ast), result);
  }
}