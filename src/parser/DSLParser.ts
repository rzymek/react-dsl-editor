import {
  asException,
  error,
  GrammarNode,
  isParserError,
  isParserSuccess,
  ParserContext,
  ParserResult,
  ParserSuccess,
  success,
} from './types';
import {CSTNode} from './CSTNode';
import {flatMap, isEmpty, pipe} from 'remeda';
import {repeat, sequence} from "./grammar/core";
import {withOffset} from "./withOffset";
import {newline} from "./grammar/composite/newline";
import {pathToString} from "./pathToString";

function _flatCST<T extends string>(result: CSTNode<T>): CSTNode<T>[] {
  if (result.children && !isEmpty(result.children)) {
    return pipe(result.children, flatMap(it => flatCST(it)));
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

function topError(parserResult: ParserResult<string> & { message?: string } | undefined): DSLError[] {
  if (!parserResult || isParserSuccess(parserResult)) return [];
  return [{
    message: parserResult.expected.map(it => JSON.stringify(it)).join(' or ') + ` expected, but got ${JSON.stringify(parserResult.got)} (${pathToString(parserResult.path)})`,
    expected: parserResult.expected,
    start: parserResult.offset,
    end: parserResult.offset + Math.max(1, parserResult.got.length),
    depth: 1,
  }]
}

export class DSLParser<T extends string> {
  private readonly grammar: GrammarNode<T>;

  constructor(grammar: GrammarNode<T>) {
    this.grammar = sequence(grammar, repeat(newline, 0));
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

  public parseStrict(input: string): ParserSuccess<T> | undefined {
    const {parserResult} = this._parseStrict(input)
    if (isParserError(parserResult)) {
      return undefined;
    }
    return parserResult;
  }

  public parse(input: string): DSL<T> {
    const {parserResult} = this._parseStrict(input);
    if (isParserError(parserResult)) {
      throw asException(parserResult);
    }
    const cst: CSTNode<T> = withOffset(parserResult);
    const terminals = flatCST(cst);
    return {
      cst,
      terminals,
      result: parserResult,
      strictResult: isParserSuccess(parserResult) ? parserResult : undefined,
      errors: [
        ...topError(parserResult),
        ...topError(parserResult.errorLabel)
      ],
    };
  }
}

const trailingInput: GrammarNode = {
  children: [],
  parse: text => success({children: [], grammar: trailingInput, text}),
  type: 'trailing-input' as never,
  suggestions: () => [],
}
