import { isParserError, type Parse, ParserResult } from './types';

export function optional<T extends string>(subparser: Parse<T>): Parse<T> {
  return (text):ParserResult<T> => {
    const result = subparser(text);
    if (isParserError(result)) {
      return {
        type: result.type,
        text: '',
        errors: []
      };
    } else {
      return result;
    }
  };
}