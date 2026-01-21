import { DslEditor } from '../editor/DslEditor';
import './Demo.css';
import { useState } from 'react';
import dedent from 'string-dedent';
import { CSTNode } from '../parser/CSTNode';
import { DSL } from '../parser';
import { timesheet } from './timesheet';
import { projectDsl } from './projectsDsl';

// const {grammar} = timesheet();
// const {grammar, suggest} = funcDemo();
const grammar = projectDsl;

function suggestions(node: CSTNode<string>): string[] {
  return [];//[node.grammar.meta?.name as string ?? '?'];
}

function Demo() {
  const [code, setCode] = useState(dedent`
    projects:
      pro1
    display:
      total: h.m
      
    `);
  const [output, setOutput] = useState<DSL<string>>();
  const [wrap, setWrap] = useState(false);
  return <div>
    <label><input type="checkbox" checked={wrap} onChange={e => setWrap(e.currentTarget.checked)}/>wrap</label>

    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr',
      backgroundColor: !output ? '#ffebeb' : undefined
    }}>
      <DslEditor
        wrap={wrap}
        code={code}
        onChange={setCode}
        grammar={grammar}
        suggestions={suggestions}
        onParsed={setOutput}/>
    </div>
  </div>;
}

export default Demo;
