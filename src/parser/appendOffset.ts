import type { ParserError } from './types';

export function appendOffset(error: ParserError, offset: number): ParserError {
  return {
    ...error,
    offset: error.offset + offset,
  };
}

export function appendOffsets(errors: ParserError[], offsets: number):ParserError[] {
  return errors.map(error => appendOffset(error, offsets));
}