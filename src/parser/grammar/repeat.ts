import {isParserError, isParserSuccess, type Parse, type ParserResult, ParserSuccess} from '../types';
import {tap} from '../tap';
import {faultTolerance} from "../faultTolerance";

export function repeat<T extends string>(type: T = 'repeat' as T, parser: Parse<T>, min = 1, max = Infinity): Parse<T> {
  function repeat(text: string): ParserResult<T> {
    tap(repeat, text);
    const results: ParserSuccess<T>[] = [];
    let offset = 0;
    for (let i = 0; i < max && offset < text.length; i++) {
      let result = parser(text.substring(offset));
      if (isParserError(result)) {
        if (i >= min) {
          break;
        } else {
          const corrected = faultTolerance(result, results[i - 1], repeat)
          if (corrected) {
            result = corrected;
          } else {
            return result;
          }
        }
      }
      offset += result.text.length;
      results.push(result);
      if (result.text.length === 0) {
        break;
      }
    }
    return {
      type,
      parser: repeat,
      text: results.map(it => it.text).join(''),
      children: results,
    };
  }

  repeat.type = type;
  repeat.suggestions = parser.suggestions;
  return repeat;
}