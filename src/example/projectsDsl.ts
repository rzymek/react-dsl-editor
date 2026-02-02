import {pattern} from '../parser/grammar/core/pattern';
import {sequence} from '../parser/grammar/core/sequence';
import {alternative} from '../parser/grammar/core/alternative';
import {term} from '../parser/grammar/composite/term';
import {repeat} from '../parser/grammar/core/repeat';
import {named} from '../parser/grammar/core/named';
import {newline} from "../parser/grammar/composite/newline";
import {ws} from "../parser/grammar/composite/ws";

const indent = pattern(/[ \t]+/);

const comment = pattern(/#[^#\n]*\n/);
const displayTotal = named("display.total", alternative(term('h:m'), term('h.m')));

export const displayConfig = sequence(
  term('time:'), ws, displayTotal, newline,
);
const projectsConfig = sequence(
  term('projects:'), newline,
  repeat(
    alternative(
      sequence(indent, named('project', pattern(/[a-z0-9]+/i)), newline),
      comment,
    ),
  ),
);
const grammar = repeat(
  alternative(
    displayConfig,
    projectsConfig,
    comment,
  )
)

export const projectDsl = grammar;