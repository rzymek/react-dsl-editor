import { isParserError, isParserSuccess, type Parse, type ParserSuccess, type RecoverableError } from './types.ts';
import { last } from '../lib/last.ts';

export function sequence(type = 'sequence', ...seq: Parse[]): Parse {
  return (text: string) => {
    const results: (ParserSuccess|RecoverableError)[] = [];
    let offset = 0;
    for (const parser of seq) {
      const result = parser(text.substring(offset));
      if (isParserError(result)) {
        const lastResult = last(results);
        if (lastResult && isParserSuccess(lastResult)) {
          results.push({
            type: result.type,
            missing: true,
          });
        }
        continue;
      }
      offset += isParserSuccess(result) ? result.text.length : 0;
      results.push(result);
    }
    return {
      type,
      text: text.substring(0, offset),
      children: results,
    };
  };
}