import {DslEditor} from '../editor/DslEditor';
import './Demo.css';
import {useState} from 'react';
import dedent from 'string-dedent';
import {CSTOf, DSL, nodeName} from '../parser';
import {projectDsl} from './projectsDsl';

// const {grammar} = timesheet();
// const {grammar, suggest} = funcDemo();
const grammar = projectDsl;

function suggestions(node: CSTOf<typeof projectDsl>): string[] {
  if(nodeName(node) === 'project') {
    return ['proj1',"proj2"]
  }
  return [];
}

function Demo() {
  const [code, setCode] = useState(dedent`
    display:
      total: 
    projects:
      pro1
      
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
