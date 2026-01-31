import {DslEditor} from '../editor/DslEditor';
import './Demo.css';
import {useState} from 'react';
import dedent from 'string-dedent';
import {CSTOf, DSL, nodeName, visitPredicate} from '../parser';
import {projectDsl} from "./projectsDsl";

// const {grammar, suggest} = funcDemo();
const grammar = projectDsl;
// const grammar = timesheetGrammar;

function suggestions(node: CSTOf<typeof grammar>): string[] {
  if (nodeName(node) === 'project') {
    return ['proj1', "proj2"]
  }
  // if (nodeName(node) === 'description') {
  //   return ['proj1', "proj2"]
  // }
  return [];
}


const projectCode = dedent`
  display:
    total: 
  projects:
    pro1
    
`;

const timesheetCode = dedent`
  1 10:00-p1-11:30-p2
`
const initialCode =
  // timesheetCode ?? projectCode
  projectCode ?? timesheetCode;

function Demo() {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<DSL<string>>();
  const [wrap, setWrap] = useState(false);
  return <div>
    <label><input type="checkbox" checked={wrap} onChange={e => setWrap(e.currentTarget.checked)}/>wrap</label>

    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateRows: '1fr 1fr',
      backgroundColor: !output ? '#ffebeb' : undefined
    }}>
      <DslEditor
        wrap={wrap}
        code={code}
        onChange={setCode}
        grammar={grammar}
        suggestions={suggestions}
        onParsed={setOutput}/>
      <pre>
        {output?.result && visitPredicate(output.result,
          it => !!nodeName(it),
          it => `${nodeName(it)}: ${it.text}`).join('\n')}
        {JSON.stringify(output?.errors,null,2)}
      </pre>
    </div>
  </div>;
}

export default Demo;
