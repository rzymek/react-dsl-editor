import {range} from 'remeda';
import {pattern} from '../parser/grammar/core/pattern';
import {repeat} from '../parser/grammar/core/repeat';
import {sequence} from '../parser/grammar/core/sequence';
import {term} from '../parser/grammar/composite/term';
import {GrammarNode, named, newline} from '../parser';

export function timesheet() {
  const hour = pattern(/[0-9]{1,2}:[0-9]{2}/);
  const startSegment: GrammarNode<"start"> = sequence(
    named('start', hour),
    term('-'),
    pattern(/[^-|]+/),
    term('-'),
  );
  const line = sequence(
    named('day', pattern(/[0-3]?[0-9]/)),
    repeat(sequence(
      pattern(/[ \t]/),
      startSegment,
      named('end', hour),
    ), 1),
    newline,
  );
  line.meta = {debugName: 'line'}
  startSegment.meta = {debugName: 'startSegment'}
  const grammar = repeat(named('line', line));

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