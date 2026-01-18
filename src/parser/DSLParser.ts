import {
  asException,
  GrammarNode,
  isParserError,
  isParserSuccess,
  ParserError,
  ParserResult,
  ParserSuccess,
} from './types';
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

export interface DSLError {
  message: string,
  start: number,
  end: number,
}

export interface DSL<T extends string> {
  cst: CSTNode<T>;
  terminals: CSTNode<T>[];
  result: ParserSuccess<T>;
  strictResult: ParserSuccess<T> | undefined;
  errors: DSLError[];
}

function toDSLError(parserResult: ParserError<string>) {
  return {
    message: `Expected '${parserResult.expected}', but got '${parserResult.got}'`,
    start: parserResult.offset,
    end: parserResult.offset + Math.max(...parserResult.expected.map(it=>it.length))
  };
}

function getErrors<T extends string>(parserResult: ParserResult<T>) {
  if (isParserSuccess(parserResult)) {
    return [];
  }
  return [
    toDSLError(parserResult),
  ];
}

export class DSLParser<T extends string> {
  private readonly grammar: GrammarNode<T>;

  constructor(grammar: GrammarNode<T>) {
    this.grammar = sequence(grammar, eof);
  }

  public parse(input: string): DSL<T> {
    const parserResult = this.grammar.parse(input, {
      faultTolerant: false,
      faultCorrection: r => r,
    });
    const faultTolerantResult = isParserError(parserResult)
      ? this.grammar.parse(input, {
        faultTolerant: true,
        faultCorrection: r => r,
      })
      : parserResult;

    if (isParserError(faultTolerantResult)) {
      throw asException(faultTolerantResult);
    }
    const cst: CSTNode<T> = withOffset(faultTolerantResult);

    const terminals = flatCST(cst);
    return {
      cst,
      terminals,
      result: faultTolerantResult,
      strictResult: isParserSuccess(parserResult) ? parserResult : undefined,
      errors: getErrors(parserResult),
    };
  }
}