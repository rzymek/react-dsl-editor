import { EditableSyntaxHighlighter } from '../editor/EditableSyntaxHighlighter.tsx';
import './Demo.css';
import { useState } from 'react';
import type { NodeTypes, ParserResult } from '../parser/types.ts';
import { sequence } from '../parser/sequence.ts';
import { pattern } from '../parser/pattern.ts';
import { term } from '../parser/term.ts';
import { ws } from '../parser/ws.ts';
import { repeat } from '../parser/repeat.ts';
import { optional } from '../parser/optional.ts';
import { range } from 'remeda';


const hour = pattern('[0-9]{1,2}:[0-9]{2}');
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

function Demo() {
  const [code, setCode] = useState(`  
  `.trim());
  const [output, setOutput] = useState<ParserResult<string>>();
  return <div style={{minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr', height: '75vh'}}>
    <EditableSyntaxHighlighter
      code={code}
      onChange={setCode}
      grammar={grammar}
      suggestions={suggest}
      onParsed={setOutput}/>
    <pre style={{overflow: 'auto'}}>{JSON.stringify(output, null, 2)}</pre>
  </div>;
}

export default Demo;
