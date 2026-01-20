import { asException, GrammarNode, isParserError, isParserSuccess, ParserError, ParserSuccess } from './types';
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
  depth: number,
}

export interface DSL<T extends string> {
  cst: CSTNode<T>;
  terminals: CSTNode<T>[];
  result: ParserSuccess<T>;
  strictResult: ParserSuccess<T> | undefined;
  errors: DSLError[];
}

function getErrors<T extends string>(node: CSTNode<T>, depth = 1): DSLError[] {
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
        return 'none';
      },
    });
    let faultTolerantResult = parserResult;
    if (isParserError(parserResult)) {
      faultTolerantResult = this.grammar.parse(input, {
        depth: 0,
        faultToleranceMode(_grammar, context) {
          const depthPercentage = context.depth / maxDepth;
          return depthPercentage > 0.75 ? 'none' : 'skip-input';
          // console.log('faultToleranceMode', grammar.type, JSON.stringify(grammar.meta, (key, value) => key === 'regex' ? value.toString() : value), context.depth, mode, depthPercentage);
        },
      });
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