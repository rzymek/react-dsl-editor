import { optional } from '../parser/grammar/core/optional';
import { pattern } from '../parser/grammar/core/pattern';
import { sequence } from '../parser/grammar/core/sequence';
import { alternative } from '../parser/grammar/core/alternative';
import { term } from '../parser/grammar/composite/term';
import { eof } from '../parser/grammar/core/eof';
import { repeat } from '../parser/grammar/core/repeat';
import { named } from '../parser/grammar/core/named';

const requiredWS = pattern(/[ \t]+/);
const ws = optional(requiredWS);

// const newLine = named('newline',sequence(ws, alternative(pattern(/\n/), eof)));
const newLine = named('newline',alternative(pattern(/\n/), eof));
const comment = named('comment',pattern(/#[^#\n]*\n/));
const grammar = repeat(
  alternative(
    newLine,
    sequence(
      term('projects:'), newLine,
      repeat(
        named('prws',sequence(
        requiredWS, named('project', pattern(/[a-z0-9:.]+/)), newLine,
      ))),
    ),
    sequence(
      term('display:'), newLine,
      alternative(
        sequence(
          requiredWS, term('total:'), ws, named('display.total', alternative(
            term('h:m'),
            term('h.m'),
          )), newLine,
        ),
      ),
    ),
    comment,
  ),
);

export const projectDsl = grammar;