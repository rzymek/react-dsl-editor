import {
  asException,
  GrammarNode,
  isParserError,
  isParserSuccess,
  ParserContext, ParserError,

  ParserSuccess,
} from './types';
import { CSTNode } from './CSTNode';
import { sequence } from './grammar/core/sequence';
import { eof } from './grammar/core/eof';
import { filter, isEmpty, map, only, pipe, firstBy, sum, sortBy } from 'remeda';
import { disjointIntervals } from '../editor/disjointIntervals';

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
    recoverableError: parserResult.recoverableError ?? false,
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
  return _flatCST(result)
    .filter(it => it.text !== '');
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

function getErrors<T extends string>(node: CSTNode<T>): DSLError[] {
  const childErrors = node.children?.flatMap(it => getErrors(it)) ?? [];
  if (node.recoverableError) {
    const error: DSLError = {
      start: node.offset,
      end: Math.max(node.end, node.offset + 1),
      message: node.grammar.type,
    };
    return [
      error,
      ...childErrors,
    ];
  } else {
    return childErrors;
  }
}

function totalErrorsLength(result: ParserSuccess<string>): number {
  const errors = getErrors(withOffset(result));
  return pipe(
    disjointIntervals(errors),
    map(it => Math.max(1, it.end - it.start)),
    sum(),
  );
}

export class DSLParser<T extends string> {
  private readonly grammar: GrammarNode<T>;

  constructor(grammar: GrammarNode<T>) {
    this.grammar = sequence(grammar, eof);
  }

  public parse(input: string): DSL<T> {
    const parserResult = this.grammar.parse(input, {
      faultCorrection: r => r,
    });
    let faultTolerantResult = parserResult;
    if (isParserError(parserResult)) {
      const faultToleranceModes: ParserContext['faultToleranceMode'][] = [
        'skip-input',
        'skip-parser',
      ];
      console.log(pipe(
        faultToleranceModes,
        map(faultToleranceMode => {
          return {
            faultToleranceMode,
            result: this.grammar.parse(input, {
              faultToleranceMode,
              faultCorrection: r => r,
            }),
          };
        }),
        filter(it => isParserSuccess(it.result)),
        map(it => ({mode: it.faultToleranceMode, weight: totalErrorsLength(it.result as ParserSuccess<string>)})),
        sortBy(it => it.weight),
      ));
      faultTolerantResult = pipe(
        faultToleranceModes,
        map(faultToleranceMode =>
          this.grammar.parse(input, {
            faultToleranceMode,
            faultCorrection: r => r,
          })),
        filter(isParserSuccess),
        firstBy(totalErrorsLength),
      ) ?? parserResult;
    }
    if (isParserError(faultTolerantResult)) {
      throw asException(parserResult as ParserError<T>);
    }

    const cst: CSTNode<T> = withOffset(faultTolerantResult);

    const terminals = flatCST(cst);
    return {
      cst,
      terminals,
      result: faultTolerantResult,
      strictResult: isParserSuccess(parserResult) ? parserResult : undefined,
      errors: getErrors(cst),
    };
  }
}