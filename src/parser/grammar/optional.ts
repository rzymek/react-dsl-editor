import { isParserError, type Parse, ParserResult } from '../types';
import { tap } from '../tap';

export function optional<T extends string>(subparser: Parse<T>): Parse<T | 'optional'> {
  function optional(text: string): ParserResult<T | 'optional'> {
    tap(optional, text);
    const result = subparser(text);
    if (isParserError(result)) {
      return {
        type: 'optional',
        parser: optional,
        text: '',
      };
    } else {
      return {
        type: 'optional',
        parser: optional,
        text: result.text,
        children: [result],
      };
    }
  }

  optional.type = 'optional'
  optional.suggestions = () => [];
  return optional;
}