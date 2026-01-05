import { ParserError, ParserResult, ParserSuccess } from '../types';
import { tap } from '../tap';

export function eof(text: string): ParserResult<'eof'> {
  tap(eof, text);
  if (text.length === 0) {
    return {
      type: 'eof',
      text: '',
      parser: eof,
    } satisfies ParserSuccess<'eof'>;
  } else {
    return {
      type: 'eof',
      expected: [''],
      got: text,
      offset: 0,
      parser: eof,
    } satisfies ParserError<'eof'>;
  }
}
eof.type='eof'
eof.suggestions = () => [];
