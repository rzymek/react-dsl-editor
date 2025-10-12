import { isParserSuccess, type Parse, type ParserError, type ParserResult } from './types.ts';

export function repeat(type = 'repeat', parser: Parse, min = 1, max = Infinity): Parse {
  return (text: string) => {
    const results: ParserResult[] = [];
    let offset = 0;
    let recoverableError: ParserError | undefined = undefined;
    for (let i = 0; i <= max; i++) {
      const result = parser(text.substring(offset));
      if (isParserSuccess(result)) {
        offset += result.text.length;
      } else {
        if (i >= min) {
          break;
        }
        recoverableError = result;
        recoverableError.error.offset += offset;
      }
      results.push(result);
    }
    return {
      type,
      text: text.substring(0, offset),
      recoverableError,
      children: results,
    };
  };
}