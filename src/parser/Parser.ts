import {isParserError, type Parse, ParserResult} from './types';
import {trimEmptyNode} from './ast/trimEmptyNode';
import {ASTNode} from './ASTNode';
import {limit} from "./tap";
import {sequence} from "./grammar/sequence";
import {eof} from "./grammar/eof";

function withOffset<T extends string>(parserResult: ParserResult<T>, offset = 0): ASTNode<T> {
  if (isParserError(parserResult)) {
    return {
      children: [],
      error: parserResult,
      suggestions: parserResult.expected,
      offset: 0,
      text: '',
      type: parserResult.type
    }
  }
  let childOffset = offset;
  return {
    suggestions: parserResult.parser.suggestions(),
    ...parserResult,
    children: parserResult.children?.map((it, idx, arr) => {
      const {text} = arr[idx - 1] ?? {text: ''}
      childOffset += text.length;
      return withOffset(it, childOffset);
    }),
    offset
  }
}

export class Parser<T extends string> {
  private readonly parser: Parse<T | '_content_' | 'eof'>;

  constructor(parser: Parse<T>) {
    this.parser = sequence<T | '_content_' | 'eof'>('_content_', parser, eof);
  }

  public parse(input: string): ASTNode<T | '_content_' | 'eof'> {
    limit.value = 5000;
    const result = withOffset(this.parser(input));
    const normalized = [
      trimEmptyNode,
      // <T>(it:T)=>it,
    ].reduce((ast, fn) => fn(ast), result);
    return normalized;
  }
}