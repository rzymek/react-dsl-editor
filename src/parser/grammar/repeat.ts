import { isParserError, type Parse, type ParserResult, ParserSuccess } from '../types';

export function repeat<T extends string>(type: T = 'repeat' as T, parser: Parse<T>, min = 1, max = Infinity): Parse<T> {
  function repeat(text: string): ParserResult<T> {
    const results: ParserSuccess<T>[] = [];
    let offset = 0;
    for (let i = 0; i < max; i++) {
      const result = parser(text.substring(offset));
      if (isParserError(result)) {
        if (i >= min) {
          break;
        } else {
          return result;
        }
      }
      offset += result.text.length;
      results.push(result);
    }
    return {
      type,
      parser: repeat,
      text: results.map(it => it.text).join(''),
      children: results,
    };
  }

  repeat.type = type;
  return repeat;
}