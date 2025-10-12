export type ParserSuccess = { type: string, text: string, children?: ParserResult[], hasError?: boolean, strict?: true };
export type ParserError = { type: string, error: { expected: string|RegExp, got: string } };
export type ParserResult = ParserSuccess | ParserError;
export type Parse = (text: string) => ParserResult;

export function isParserError(result: ParserResult): result is ParserError {
  return 'error' in result && result.error !== undefined;
}

export function isParserSuccess(result: ParserResult): result is ParserSuccess {
  return 'text' in result && result.text !== undefined;
}