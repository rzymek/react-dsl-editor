import { isEmpty } from 'remeda';
import { isParserSuccess, type Parse, type ParserError, type ParserResult } from './types.ts';
import { appendOffset } from './appendOffset.ts';

export function sequence(type = 'sequence', ...seq: Parse[]): Parse {
  return (text: string) => {
    const results: ParserResult[] = [];
    let offset = 0;
    const recoverableErrors: ParserError[] = [];
    for (const parser of seq) {
      const result = parser(text.substring(offset));
      if (isParserSuccess(result)) {
        offset += result.text.length;
        if (!isEmpty(result.recoverableErrors ?? [])) {
          result.recoverableErrors!.forEach(error => {
            recoverableErrors.push(appendOffset(error, offset))
          })
        }
      } else {
        recoverableErrors.push(appendOffset(result,offset));
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

