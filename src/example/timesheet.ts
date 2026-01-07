import { range } from 'remeda';
import { pattern } from '../parser/grammar/core/pattern';
import { repeat } from '../parser/grammar/core/repeat';
import { sequence } from '../parser/grammar/core/sequence';
import { term } from '../parser/grammar/composite/term';
import { ws } from '../parser/grammar/composite/ws';
import { optional } from '../parser/grammar/core/optional';

export function timesheet() {
  const hour = pattern(/[0-9]{1,2}:[0-9]{2}/);
  const grammar = repeat(
    sequence(
      sequence(
        pattern(/[0-9]{2}/),
        term('.'),
        pattern(/[0-9]{2}/),
        term('.'),
        pattern(/[0-9]{4}/),
      ),
      repeat(sequence(
        ws,
        repeat(sequence(
            hour,
            term('-'),
            pattern(/[^-|]+/),
            optional(pattern(/[|][^-]+/)),
            term('-'),
          ),
        ),
        hour,
      )),
      repeat(term('\n')),
    ));

  function suggest(type: string) {
    if (type === 'month') {
      return range(1, 12 + 1)
        .map(it => it.toString().padStart(2, '0'));
    } else if (type === 'day') {
      return range(1, 31 + 1)
        .map(it => it.toString().padStart(2, '0'));
    } else if (type === 'year') {
      return [new Date().getFullYear().toString()];
    }
  }

  return {grammar, suggest};
}