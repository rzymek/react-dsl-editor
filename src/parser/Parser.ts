import { asException, GrammarNode, isParserError, ParserSuccess } from './types';
import { trimEmptyNode } from './ast/trimEmptyNode';
import { CSTNode } from './ASTNode';
import { sequence } from './grammar/core/sequence';
import { eof } from './grammar/core/eof';

function withOffset<T extends string>(parserResult: ParserSuccess<T>, offset = 0): CSTNode<T> {
  let childOffset = offset;
  return {
    grammar: parserResult.grammar,
    text: parserResult.text,
    offset,
    children: parserResult.children?.map((it, idx, arr) => {
      const {text} = arr[idx - 1] ?? {text: ''};
      childOffset += text.length;
      return withOffset(it, childOffset);
    }),
  } satisfies CSTNode<T>;
}

export class Parser<T extends string> {
  private readonly grammar: GrammarNode<T>;

  constructor(grammar: GrammarNode<T>) {
    this.grammar = sequence(grammar, eof);
  }

  public parse(input: string) {
    const parserResult = this.grammar.parse(input, {
      faultTolerant: false,
    });
    if (isParserError(parserResult)) {
      throw asException(parserResult);
    }
    const result = withOffset(parserResult);
    const normalized = [
      trimEmptyNode,
    ].reduce((ast, fn) => fn(ast), result);
    return {
      cst: normalized,
      result: parserResult,
    };
  }
}