import { isEmpty } from 'remeda';
import { isParserSuccess, type Parse, type ParserError, type ParserResult } from './types.ts';
import { appendOffset } from './appendOffset.ts';

export function sequence<T extends string>(type:T = 'sequence' as T, ...seq: Parse<T>[]): Parse<T> {
  return (text: string):ParserResult<T> => {
    const results: ParserResult<T>[] = [];
    let offset = 0;
    const recoverableErrors: ParserError<T>[] = [];
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
    } as ParserResult<T>;
  };
}

