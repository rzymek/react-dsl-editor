import type { Parse, ParserSuccess } from './types.ts';

export function sequence(type = 'sequence', ...seq: Parse[]): Parse {
  return (text: string) => {
    const results: ParserSuccess[] = [];
    let offset = 0;
    for (const parser of seq) {
      const result = parser(text.substring(offset));
      if ('error' in result) {
        return {
          ...result,
          soFar: results,
        };
      }
      offset += result.text.length;
      results.push(result);
    }
    return {
      type,
      text: text.substring(0, offset),
      children: results,
    };
  };
}