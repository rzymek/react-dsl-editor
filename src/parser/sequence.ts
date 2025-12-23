import { type Parse, type ParserError, type ParserResult } from './types';
import { appendOffsets } from './appendOffset';

export function sequence<T extends string>(type: T = 'sequence' as T, ...seq: Parse<T>[]): Parse<T> {
  return (text: string): ParserResult<T> => {
    const results: ParserResult<T>[] = [];
    let offset = 0;
    const errors: ParserError<T>[] = [];
    for (const parser of seq) {
      const result = parser(text.substring(offset));
      result.errors = appendOffsets(result.errors, offset);
      offset += result.text.length;
      errors.push(...result.errors);
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
