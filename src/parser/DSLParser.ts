import {
  asException,
  GrammarNode,
  isParserError,
  isParserSuccess,
  ParserContext,
  ParserError,
  ParserResult,
  ParserSuccess,
} from './types';
import {CSTNode} from './CSTNode';
import {filter, firstBy, isEmpty, map, pipe} from 'remeda';
import {eof, sequence} from "./grammar/core";
import {totalErrorsLength} from "./totalErrorsLength";
import {getErrors} from "./getErrors";
import {withOffset} from "./withOffset";

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
  expected?: string[],
  start: number,
  end: number,
  depth: number,
}

export interface DSL<T extends string> {
  cst: CSTNode<T>;
  terminals: CSTNode<T>[];
  result: ParserSuccess<T>;
  strictResult: ParserSuccess<T> | undefined;
  errors: DSLError[];
}

function topError(parserResult: ParserResult<string>): DSLError[] {
  if (isParserSuccess(parserResult)) return [];
  return [{
    message: parserResult.expected.join(' or ') + ' expected',
    expected: parserResult.expected,
    start: parserResult.offset,
    end: parserResult.offset + Math.max(...parserResult.expected.map(it => it.length)),
    depth: 1,
  }]
}

export class DSLParser<T extends string> {
  private readonly grammar: GrammarNode<T>;

  constructor(grammar: GrammarNode<T>) {
    this.grammar = sequence(grammar, eof);
  }

  public parse(input: string): DSL<T> {
    let maxDepth = 0;
    const parserResult = this.grammar.parse(input, {
      depth: 1,
      faultToleranceMode: (_, context) => {
        maxDepth = Math.max(maxDepth, context.depth);
        return [];
      },
    });
    let faultTolerantResult = parserResult;
    if (isParserError(parserResult)) {
      const modes: ParserContext['faultToleranceMode'][] = [
        (_grammarNode, context) =>
          context.depth / maxDepth > 0.75 ? [] : ['skip-input', 'partial-match'],
        () => ['partial-match'],
        // () => ['skip-input'],
        // () => ['skip-parser'],
        // () => ['skip-parser', 'skip-input', 'fuzzy-match', 'partial-match'],
      ];
      faultTolerantResult = pipe(
        modes,
        map(mode => {
          console.log('=== fault tollerance: ', mode(this.grammar, {
            depth: 0,
            faultToleranceMode: mode,
          }))
          return this.grammar.parse(input, {
            depth: 0,
            faultToleranceMode: mode,
          });
        }),
        filter(isParserSuccess),
        firstBy(result => {
          const weight = isParserSuccess(result) ? totalErrorsLength(result) : Infinity;
          console.log({weight})
          return weight;
        })
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
      errors: [
        ...topError(parserResult),
        ...getErrors(cst)
      ],
    };
  }
}

