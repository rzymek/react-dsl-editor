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
      faultToleranceMode: () => 'none',
    });
    let faultTolerantResult = parserResult;
    if (isParserError(parserResult)) {
      const modes: FaultToleranceMode[] = ['none', 'skip-parser', 'skip-input'];
      const rand = new Random(0);
      let lastErrorsLenght = Infinity;
      for (let i = 0; i < 10; i++) {
        const x = this.grammar.parse(input, {
          faultToleranceMode(grammar) {
            if (grammar.type === 'pattern') {
              return 'none';
            }

            const mode: FaultToleranceMode = modes[rand.nextInt(0, modes.length-1)];
            // console.log('faultToleranceMode', grammar.type, mode);
            return mode;
          },
        });
        if (isParserSuccess(x)) {
          const errLen = totalErrorsLength(x);
          console.log({errLen});
          if(errLen < lastErrorsLenght && pipe(flatCST(withOffset(x)), map(it=>it.text.length), sum()) === input.length) {
            lastErrorsLenght = errLen;
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