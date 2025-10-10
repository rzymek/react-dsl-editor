import type { Parse } from './types.ts';

export function term(str: string): Parse {
  return (text) => {
    if (text.startsWith(str)) {
      return {
        type: 'term',
        text: str,
      };
    } else {
      return {
        type: 'term',
        error: `expected '${str}', got '${text}'`,
      };
    }
  };
}