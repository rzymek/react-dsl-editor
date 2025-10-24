import { isParserSuccess, type Parse, ParserError } from './types';

export function alternative<T extends string>(type:T = 'alternative' as T, ...seq: Parse<T>[]): Parse<T> {
  return (text: string) => {
    const errors: ParserError<T>[] = [];
    for (const parser of seq) {
      const result = parser(text);
      if (isParserSuccess(result)) {
        return result;
      }
      errors.push(...result.errors);
    }
    return {
      type,
      text: '',
      errors,
    };
  };
}