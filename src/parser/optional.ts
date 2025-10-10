import type { Parser } from './types.ts';

export function optional(subparser: Parser, type = 'optional'): Parser {
  return (text) => {
    const result = subparser(text);
    if ('error' in result) {
      return {
        type,
        text: '',
      };
    } else {
      return result;
    }
  };
}