import {optional} from '../parser/grammar/core/optional';
import {pattern} from '../parser/grammar/core/pattern';
import {sequence} from '../parser/grammar/core/sequence';
import {alternative} from '../parser/grammar/core/alternative';
import {term} from '../parser/grammar/composite/term';
import {repeat} from '../parser/grammar/core/repeat';
import {named} from '../parser/grammar/core/named';
import {newline} from "../parser/grammar/composite/newline";

const requiredWS = pattern(/[ \t]+/);
const ws = optional(requiredWS);

// const newLine = named('newline',sequence(ws, alternative(pattern(/\n/), eof)));
const comment = pattern(/#[^#\n]*\n/);
const displayTotal = named("display.total", alternative(term('h:m'), term('h.m')));
export const displayConfig = sequence(
  term('display:'), newline,
  requiredWS, term('total:'), ws, displayTotal, newline,
);
const projectsConfig = sequence(
  term('projects:'), newline,
  repeat(
    sequence(
      requiredWS, named('project', pattern(/[a-z0-9:.]+/)), newline,
    )),
);
const grammar = repeat(
  alternative(
    newline,
    projectsConfig,
    displayConfig,
    comment,
  ),
);

export const projectDsl = grammar;