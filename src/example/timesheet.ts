import {pattern} from '../parser/grammar/core/pattern';
import {repeat} from '../parser/grammar/core/repeat';
import {sequence} from '../parser/grammar/core/sequence';
import {term} from '../parser/grammar/composite/term';
import {alternative, named, newline, optional, ws} from '../parser';

const hour = pattern(/[0-9]{1,2}:[0-9]{1,2}/);

const projectStarted = named('projectStarted', sequence(
  named('start', hour),
  term('-'),
  named('description', pattern(/[^-]+/)),
  term('-'),
));
const grammar = repeat(
  alternative(
    pattern(/#[^\n]*(\n|$)/),

    named('line', sequence(
      named('day', pattern(/[0-3]?[0-9]/)),
      ws,
      repeat(sequence(
        optional(alternative(term('--'), ws)),
        repeat(
          projectStarted,
        ),
        optional(named('end', hour)),
      )),
      optional(sequence(
        term('-'),
        named('description',
          alternative(pattern(/[^-]+/),term(''))
        ),
      )),
      newline,
    )))
);

export const timesheetGrammar = grammar;