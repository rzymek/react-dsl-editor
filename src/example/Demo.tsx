import { DslEditor } from '../editor/DslEditor';
import './Demo.css';
import { useState } from 'react';
import { projectDsl } from './projectsDsl';
import dedent from 'string-dedent';
import { CSTNode } from '../parser/CSTNode';
import { DSL } from '../parser';

// const {grammar, suggest} = timesheet();
// const {grammar, suggest} = funcDemo();
const grammar = projectDsl;

function suggestions(node: CSTNode<string>): string[] {
  console.log(node);
  return [node.grammar.meta?.name as string ?? '?'];
}

function Demo() {
  const [code, setCode] = useState(dedent`
      projects:
        proj1
        proj2
      display:
        total: h./m
    `);
  const [output, setOutput] = useState<DSL<string>>();
  const [wrap, setWrap] = useState(false);
  return <div>
    <label><input type="checkbox" checked={wrap} onChange={e => setWrap(e.currentTarget.checked)}/>wrap</label>
    <div style={{
      minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr', height: '75vh',
      backgroundColor: !output ? '#ffebeb' : undefined
    }}>
      <DslEditor
        wrap={wrap}
        code={code}
        onChange={setCode}
        grammar={grammar}
        suggestions={suggestions}
        onParsed={setOutput}/>
      <pre style={{overflow: 'auto'}}>{
        JSON.stringify(output, null, 2)
      }</pre>
    </div>
  </div>;
}

export default Demo;
