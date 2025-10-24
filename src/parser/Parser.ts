import { type Parse, type ParserResult } from './types';
import { trimEmptyNode } from './ast/trimEmptyNode';
import { ASTNode } from './ASTNode';

function withOffset<T extends string>(parserResult: ParserResult<T>, offset = 0): ASTNode<T> {
  let childOffset = offset;
  return {
    ...parserResult,
    children: parserResult.children?.map((it,idx,arr)=> {
      const {text} = arr[idx-1] ?? {text:''}
      childOffset += text.length;
      return withOffset(it, childOffset);
    }),
    offset,
  }
}

export class Parser<T extends string> {
  private readonly parser: Parse<T>;

  constructor(parser: Parse<T>) {
    this.parser = parser;
  }

  public parse(input: string): ASTNode<T> {
    const result = withOffset(this.parser(input));
    if (result.text !== input) {
      const offset = result.text.length;
      result.errors.push({
        offset,
        got: input.substring(offset),
        expected: '',
        type: 'error' as T
      });
    }
    const normalized = [
      trimEmptyNode,
      // <T>(it:T)=>it,
    ].reduce((ast, fn) => fn(ast), result);
    return normalized;
  }
}