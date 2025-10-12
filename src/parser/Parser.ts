import { type Parse, type ParserResult } from './types.ts';
import { trimEmptyNode } from './ast/trimEmptyNode.ts';

export class Parser {
  private readonly parser: Parse;

  constructor(parser: Parse) {
    this.parser = parser;
  }

  public parse(input: string): ParserResult {
    const result = this.parser(input);
    // if (isParserError(result)) {
    //   console.log(result);
    //   throw new ParsingError(`Expected '${result.error.expected}' but got '${result.error.got}'`);
    // }
    const normalized = [
      trimEmptyNode,
      // <T>(it:T)=>it,
    ].reduce((ast, fn) => fn(ast), result);
    return normalized;
  }
}