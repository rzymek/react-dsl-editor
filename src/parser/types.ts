export interface ParserError {
  type: string,
  error: {
    offset: number;
    expected: string | RegExp,
    got: string
  }
}

export interface ParserSuccess {
  type: string,
  text: string,
  children?: ParserResult[],
  recoverableErrors?: ParserError[],
}

export type ParserResult = ParserSuccess | ParserError;
export type Parse = (text: string) => ParserResult;

export function isParserError(result: ParserResult): result is ParserError {
  return 'error' in result && result.error !== undefined;
}

export function isParserSuccess(result: ParserResult): result is ParserSuccess {
  return 'text' in result && result.text !== undefined;
}