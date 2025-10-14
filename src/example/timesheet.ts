import { type NodeTypes, optional, pattern, repeat, sequence, term, ws } from '../parser';
import { range } from 'remeda';

export function timesheet() {
  const hour = pattern('[0-9]{1,2}:[0-9]{2}', 'hour');
  const grammar = repeat('timesheet',
    sequence('line',
      sequence('date',
        pattern('[0-9]{2}', 'day'),
        term('.'),
        pattern('[0-9]{2}', 'month'),
        term('.'),
        pattern('[0-9]{4}', 'year'),
      ),
      ws,
      repeat('entries',
        sequence('start',
          hour,
          term('-'),
          pattern('[^-|]+', 'project'),
          optional(pattern('[|][^-]+', 'subproject')),
          term('-'),
        ),
      ),
      hour,
      repeat('EOL', term('\n')),
    ));

  function suggest(type: NodeTypes<typeof grammar>) {
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