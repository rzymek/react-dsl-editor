import {optional} from '../parser/grammar/core/optional';
import {pattern} from '../parser/grammar/core/pattern';
import {sequence} from '../parser/grammar/core/sequence';
import {alternative} from '../parser/grammar/core/alternative';
import {term} from '../parser/grammar/composite/term';
import {eof} from '../parser/grammar/core/eof';
import {repeat} from '../parser/grammar/core/repeat';
import {named} from '../parser/grammar/core/named';

const requiredWS = pattern(/[ \t]+/);
const ws = optional(requiredWS);

// const newLine = named('newline',sequence(ws, alternative(pattern(/\n/), eof)));
const newLine = alternative(pattern(/\n/), eof);
const comment = pattern(/#[^#\n]*\n/);
export const displayConfig = sequence(
  term('display:'), newLine,
  alternative(
    sequence(
      requiredWS, term('total:'), ws, term('h:m'), newLine,
    ),
  ),
);
const grammar = repeat(
  alternative(
    newLine,
    sequence(
      term('projects:'), newLine,
      repeat(
        sequence(
          requiredWS, named('project', pattern(/[a-z0-9:.]+/)), newLine,
        )),
    ),
    displayConfig,
    comment,
  ),
);

export const projectDsl = sequence(grammar, eof);