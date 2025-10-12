import { isParserSuccess, type Parse, type ParserError } from './types.ts';

export function alternative(type = 'alternative', ...seq: Parse[]): Parse {
  return (text: string) => {
    const errors: ParserError[] = [];
    for (const parser of seq) {
      const result = parser(text);
      if (isParserSuccess(result)) {
        return result;
      }
      errors.push(result);
    }
    return {
      type,
      text: '',
      recoverableErrors: errors,
    };
  };
}