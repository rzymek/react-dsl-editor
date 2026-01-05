import {alternative, eof, type NodeTypes, optional, pattern, repeat, sequence, term} from '../parser';

const ws = optional(pattern('[ \\t]+', 'ws'));

const newLine = sequence('newLine',
  ws, alternative('eol',
    term('\n'), eof
  )
);
const comment = pattern('#[^#\\n]*', 'comment');
const grammar = repeat('config',
  alternative('line',
    sequence('section:projects',
      term('projects:'), newLine,
      repeat('projects',
        sequence('project', ws, pattern(`[^/\n]+`, 'projectName'), newLine),
      ),
    ),
    sequence('section:display',
      term('display:'), newLine,
      alternative('alt',
        sequence('seq',
          ws, term('total:'), ws, alternative('totalDisplay',
            term('h:m'),
            term('h.m'),
          ), newLine,
        ),
      ),
    ),

    // sequence('commentLine', comment, newLine),
    newLine,

  ),
);

export const projectDsl = {
  grammar,
  suggest(type: NodeTypes<typeof grammar>) {
    return [type];
  },
};