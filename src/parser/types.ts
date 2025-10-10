export type ParserSuccess = { type: string, text: string, children?: (ParserSuccess | RecoverableError)[] };
export type RecoverableError = { type: string, missing: true }
export type ParserError = { type: string, error: string };
export type ParserResult = ParserError | ParserSuccess | RecoverableError;
export type Parse = (text: string) => ParserResult;

export function isParserError(result: ParserResult): result is ParserError {
  return 'error' in result && result.error !== undefined;
}

export function isParserSuccess(result: ParserResult): result is ParserSuccess {
  return 'text' in result && result.text !== undefined;
}