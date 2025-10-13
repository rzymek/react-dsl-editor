import { isParserError, type Parse, type ParserSuccess } from './types.ts';

export function optional<T extends string>(subparser: Parse<T>): Parse<T> {
  return (text):ParserSuccess<T> => {
    const result = subparser(text);
    if (isParserError(result)) {
      return {
        type: result.type,
        text: '',
      };
    } else {
      return result;
    }
  };
}