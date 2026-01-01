import { isParserError, type Parse, ParserResult } from './types';

export function optional<T extends string>(subparser: Parse<T>): Parse<T> {
  function optional(text: string): ParserResult<T> {
    const result = subparser(text);
    if (isParserError(result)) {
      return {
        type: result.type,
        parser: optional,
        text: '',
        errors: [],
      };
    } else {
      return result;
    }
  }

  return optional;
}