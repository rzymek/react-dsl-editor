import { isParserError, type Parse, type ParserError, type ParserResult } from './types';
import { appendOffset } from './appendOffset';

export function repeat<T extends string>(type: T = 'repeat' as T, parser: Parse<T>, min = 1, max = Infinity): Parse<T> {
  return (text: string): ParserResult<T> => {
    const results: ParserResult<T>[] = [];
    let offset = 0;
    const errors: ParserError<T>[] = [];
    for (let i = 0; i < max; i++) {
      const result = parser(text.substring(offset));
      result.errors.forEach(error =>
        errors.push(appendOffset(error, offset)),
      );
      offset += result.text.length;
      if ((isParserError(result) || errors.length > 0) && i >= min) {
        break;
      }
      results.push(result);
    }
    return {
      type,
      text: results.map(it => it.text).join(''),
      errors,
      children: results,
    };
  };
}