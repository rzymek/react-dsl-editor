import {
  asException,
  FaultToleranceMode,
  GrammarNode,
  isParserError,
  isParserSuccess,
  ParserError,
  ParserSuccess,
} from './types';
import { CSTNode } from './CSTNode';
import { sequence } from './grammar/core/sequence';
import { eof } from './grammar/core/eof';
import { isEmpty, map, pipe, sum } from 'remeda';
import { disjointIntervals } from '../editor/disjointIntervals';
import { Random } from './Random';

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
  depth:number,
}

export interface DSL<T extends string> {
  cst: CSTNode<T>;
  terminals: CSTNode<T>[];
  result: ParserSuccess<T>;
  strictResult: ParserSuccess<T> | undefined;
  errors: DSLError[];
}

function getErrors<T extends string>(node: CSTNode<T>, depth: number): DSLError[] {
  const childErrors = node.children?.flatMap(it => getErrors(it, depth + 1)) ?? [];
  if (node.recoverableError) {
    const error: DSLError = {
      start: node.offset,
      end: Math.max(node.end, node.offset + 1),
      message: node.grammar.type,
      depth,
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
  const errors = getErrors(withOffset(result),1);
  return pipe(
    disjointIntervals(errors),
    map(it => Math.max(1, it.end - it.start)),
    sum(),
  );
}

function selectMode(depthPercentage: number, rand: Random): FaultToleranceMode {
  return 'skip-input';
  // if (depthPercentage < 0.5) {
  //   return 'none';
  // } else if (rand.nextInt(0,100) < 50) {
  //   return 'skip-parser';
  // } else {
  //   return 'skip-input';
  // }
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
      faultToleranceMode: (_,context) => {
        maxDepth = Math.max(maxDepth, context.depth);
        return 'none';
      },
    });
    let faultTolerantResult = parserResult;
    if (isParserError(parserResult)) {
      let lastErrorsLength = Infinity;
      for (let i = 0; i < 1; i++) {
        const x = this.grammar.parse(input, {
          depth: 0,
          faultToleranceMode(grammar, context) {
            const depthPercentage = context.depth / maxDepth;
            const mode = depthPercentage > 0.75 ? 'none' : 'skip-input';
            console.log('faultToleranceMode', grammar.type, JSON.stringify(grammar.meta, (key, value)=>key==='regex'?value.toString():value), context.depth, mode, depthPercentage);
            return mode;
          },
        });
        if (isParserSuccess(x)) {
          const errLen = totalErrorsLength(x);
          console.log({errLen});
          if (errLen < lastErrorsLength && pipe(flatCST(withOffset(x)), map(it => it.text.length), sum()) === input.length) {
            lastErrorsLength = errLen;
            faultTolerantResult = x;
          }
        }
      }
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