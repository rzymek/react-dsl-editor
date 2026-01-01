import {isParserError, type Parse, type ParserResult, ParserSuccess} from '../types';
import {tap} from '../tap';
import {faultTolerance} from "../faultTolerance";

export function sequence<T extends string>(type: T = 'sequence' as T, ...seq: Parse<T>[]): Parse<T> {
  function sequence(text: string): ParserResult<T> {
    tap(sequence, text);
    const results: ParserSuccess<T>[] = [];
    let offset = 0;
    for (const parser of seq) {
      const rest = text.substring(offset);
      let result = parser(rest);
      if (isParserError(result)) {
        const resultOverride = faultTolerance(result, {
          type,
          parser: sequence,
          text:rest,
          children: results
        })
        if (resultOverride) {
          result = resultOverride
        } else {
          return result;
        }
      }
      offset += result.text.length;
      results.push(result);
    }
    return {
      type,
      parser: sequence,
      text: text.substring(0, offset),
      children: results,
    };
  }

  sequence.type = type;
  return sequence;
}
