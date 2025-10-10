import { isParserError, type Parse } from './types.ts';
import { trimEmptyNode } from './ast/trimEmptyNode.ts';
import { ParsingError } from './ParsingError.ts';

export class Parser {
  private readonly parser: Parse;

  constructor(parser: Parse) {
    this.parser = parser;
  }

  public parse(input: string) {
    const result = this.parser(input);
    if (isParserError(result)) {
      console.log(result);
      throw new ParsingError(result.error);
    }
    const normalized = [
      trimEmptyNode,
      // <T>(it:T)=>it,
    ].reduce((ast, fn) => fn(ast), result);
    return normalized;
  }
}