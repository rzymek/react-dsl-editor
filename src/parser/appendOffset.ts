import type { ParserError } from './types.ts';

export function appendOffset(error: ParserError, offset: number): {
  type: string;
  error: { offset: number; expected: string | RegExp; got: string }
} {
  return {
    ...error,
    error: {
      ...error.error,
      offset: error.error.offset + offset,
    },
  };
}