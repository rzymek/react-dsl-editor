import { isParserSuccess, type Parse, type ParserError, type ParserResult } from './types';
import { appendOffset } from './appendOffset';

export function repeat<T extends string>(type:T = 'repeat' as T, parser: Parse<T>, min = 1, max = Infinity): Parse<T> {
  return (text: string): ParserResult<T> => {
    const results: ParserResult<T>[] = [];
    let offset = 0;
    const errors: ParserError[] = [];
    for (let i = 0; i < max && errors.length === 0; i++) {
      const result = parser(text.substring(offset));
      if (isParserSuccess(result)) {
        offset += result.text.length;
      } else {
        if (i >= min) {
          break;
        }
        result.errors.forEach(error =>
          errors.push(appendOffset(error, offset)),
        );
      }
      results.push(result);
    }
    return {
      type,
      text: text.substring(0, offset),
      errors,
      children: results,
    };
  };
}