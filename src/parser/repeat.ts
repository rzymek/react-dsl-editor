import { isParserError, isParserSuccess, type Parse, type ParserError, type ParserResult } from './types.ts';
import { appendOffset } from './appendOffset.ts';
import { isEmpty } from 'remeda';

export function repeat(type = 'repeat', parser: Parse, min = 1, max = Infinity): Parse {
  return (text: string): ParserResult => {
    const results: ParserResult[] = [];
    let offset = 0;
    const recoverableErrors: ParserError[] = [];
    for (let i = 0; i < max && recoverableErrors.length === 0; i++) {
      const result = parser(text.substring(offset));
      if (isParserSuccess(result) && isEmpty(result.recoverableErrors ?? [])) {
        offset += result.text.length;
      } else {
        if (i >= min) {
          break;
        }
        if (isParserError(result)) {
          recoverableErrors.push(appendOffset(result, offset));
        } else {
          result.recoverableErrors?.forEach(error =>
            recoverableErrors.push(appendOffset(error, offset)),
          );
        }
      }
      results.push(result);
    }
    return {
      type,
      text: text.substring(0, offset),
      recoverableErrors,
      children: results,
    };
  };
}