import {
  asException,
  error,
  GrammarNode,
  isParserError,
  isParserSuccess,
  ParserContext,
  ParserError,
  ParserResult,
  ParserSuccess,
  success,
} from './types';
import {CSTNode} from './CSTNode';
import {isEmpty} from 'remeda';
import {sequence} from "./grammar/core";
import {getErrors} from "./getErrors";
import {withOffset} from "./withOffset";
import {eof} from "./grammar/composite/eof";

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
    this.grammar = sequence(grammar, eof, trailingInput);
  }

  private _parseStrict(input: string) {
    let deepestErrorPath: GrammarNode<T>[] = [];
    const parserResult = this.grammar.parse(input, {
      path: [],
      handleTerminalError(text: string, context: ParserContext<T>, grammar: GrammarNode<T>) {
        const path = [...context.path, grammar];
        if (deepestErrorPath.length < path.length) {
          deepestErrorPath = path;
        }
        return error({
          grammar,
          offset: 0,
          expected: grammar.suggestions(),
          got: text,
          path,
        })
      }
    });
    return {
      deepestErrorPath,
      parserResult
    }
  }

  public parseStrict(input: string):ParserSuccess<T>|undefined {
    const {parserResult} = this._parseStrict(input)
    if(isParserError(parserResult)) {
      return undefined;
    }
    return parserResult;
  }

  public parse(input: string): DSL<T> {
    const {parserResult, deepestErrorPath} = this._parseStrict(input);
    let faultTolerantResult = parserResult;
    const fixPaths: string[] = [pathToString(deepestErrorPath)];
    let limit = 20;
    while (limit-- > 0 && (isParserError(faultTolerantResult))) {
      let deepestErrorPath2: GrammarNode<T>[] = [];
      // console.log(limit, isParserError(faultTolerantResult) ? asException(faultTolerantResult).message : 'empty');
      faultTolerantResult = this.grammar.parse(input, {
        path: [],
        handleTerminalError(text: string, context: ParserContext<T>, grammar: GrammarNode<T>) {
          const strPath = pathToString([...context.path, grammar])
          if (fixPaths.includes(strPath)) {
            return success({
              text: text[0] ?? '',
              grammar,
              children: [],
              recoverableError: true,
            })
          } else {
            const path = [...context.path, grammar];
            if (deepestErrorPath2.length < path.length) {
              deepestErrorPath2 = path;
            }
            return error({
              grammar: grammar as GrammarNode<T>,
              offset: 0,
              expected: grammar.suggestions(),
              got: text,
              path: context.path,
            })
          }
        }
      });

      fixPaths.push(pathToString(deepestErrorPath2));
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

function pathToString(v: GrammarNode<string>[]) {
  return v.map(it =>
    `${it.type}${it.meta?.regex?.toString() ?? ''}`
  ).join('/')
}

const trailingInput: GrammarNode = {
  children: [],
  parse: text => success({children: [], grammar: trailingInput, text}),
  type: 'trailing-input' as never,
  suggestions: () => [],
}
