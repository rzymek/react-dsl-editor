import { isParserSuccess, type Parse, type ParserResult } from './types.ts';

export function sequence(type = 'sequence', ...seq: Parse[]): Parse {
  return (text: string) => {
    const results: ParserResult[] = [];
    let offset = 0;
    let hasError = false;
    for (const parser of seq) {
      const result = parser(text.substring(offset));
      if (isParserSuccess(result)) {
        offset += result.text.length;
      } else {
        hasError = true;
      }
      results.push(result);
    }
    return {
      type,
      text: text.substring(0, offset),
      hasError,
      children: results,
    };
  };
}

