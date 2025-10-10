export type ParserError = { type: string, error: string, soFar?: ParserSuccess[] };
export type ParserSuccess = { type: string, text: string, children?: ParserSuccess[] };
export type ParserResult = ParserError | ParserSuccess;
export type Parse = (text: string) => ParserResult;
