import { alternative, optional,  pattern, repeat, sequence, term, type NodeTypes } from '../parser';

const ws = pattern('[ \t]*');
const newLine = pattern('[ \\t]*\\n');
const comment = pattern('#[^#\\n]*', 'comment');
const grammar = repeat('config',
  alternative('line',
    sequence('space', ws, newLine),

    sequence('commentLine', comment, newLine),

    sequence('section:projects',
      term('projects:'), ws, newLine,
      repeat('projects',
        sequence('project',
          ws,
          pattern(`[^/\n#]+`, 'projectName'),
          optional(comment),
          newLine,
        ),
      ),
    ),

    sequence('section:display',
      term('display:'), ws, newLine,
      alternative('alt',
        sequence('seq',
          ws, term('total:'), ws,
          alternative('totalDisplay',
            term('h:m'),
            term('h.m'),
          ),
        ),
      ),
    ),
  ),
);

export const projectDsl = {
  grammar,
  suggest(type: NodeTypes<typeof grammar>) {
    if(type === 'error') {
      return undefined;
    }
  },
};