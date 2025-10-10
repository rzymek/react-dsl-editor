import type { Parser, ParserError } from './types.ts';

export function alternative(type = 'alternative', ...seq: Parser[]): Parser {
  return (text: string) => {
    const results: ParserError[] = [];
    for (const parser of seq) {
      const result = parser(text);
      if (!('error' in result)) {
        return result;
      }
      results.push(result);
    }
    return {
      type,
      error: results[0].error,
    };
  };
}