import { asException, GrammarNode, isParserError, ParserSuccess } from './types';
import { CSTNode } from './CSTNode';
import { sequence } from './grammar/core/sequence';
import { eof } from './grammar/core/eof';
import { isEmpty } from 'remeda';

function withOffset<T extends string>(parserResult: ParserSuccess<T>, offset = 0): CSTNode<T> {
  let childOffset = offset;
  return {
    text: parserResult.text,
    offset,
    end: offset + parserResult.text.length,
    children: parserResult.children?.map((it, idx, arr) => {
      const {text} = arr[idx - 1] ?? {text: ''};
      childOffset += text.length;
      return withOffset(it, childOffset);
    }),
    grammar: parserResult.grammar,
  } satisfies CSTNode<T>;
}

function _flatCST<T extends string>(result: CSTNode<T>): CSTNode<T>[] {
  if (result.children && !isEmpty(result.children)) {
    return result.children.flatMap(it => flatCST(it));
  } else {
    return [result];
  }
}

function flatCST<T extends string>(result: CSTNode<T>): CSTNode<T>[] {
  return _flatCST(result).filter(it => it.text !== '');
}

export interface ParserResult<T extends string> {
  cst: CSTNode<T>;
  terminals: CSTNode<T>[];
  result: ParserSuccess<T>;
}

export class Parser<T extends string> {
  private readonly grammar: GrammarNode<T>;

  constructor(grammar: GrammarNode<T>) {
    this.grammar = sequence(grammar, eof);
  }

  private _parse(input: string) {
    const parserResult = this.grammar.parse(input, {
      faultTolerant: false,
      faultCorrection: r => r,
    });
    if (isParserError(parserResult)) {
      return this.grammar.parse(input, {
        faultTolerant: true,
        faultCorrection: r => r,
      });
    }
    return parserResult;
  }

  public parse(input: string): ParserResult<T> {
    const parserResult = this._parse(input);
    if (isParserError(parserResult)) {
      throw asException(parserResult);
    }
    const cst: CSTNode<T> = withOffset(parserResult);
    const terminals = flatCST(cst);
    return {
      cst,
      terminals,
      result: parserResult,
    };
  }
}