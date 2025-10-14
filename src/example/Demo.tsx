import { DslEditor } from '../editor/DslEditor';
import './Demo.css';
import type { ParserResult } from '../parser';
import { useState } from 'react';
import { timesheet } from './timesheet';

const {grammar, suggest} = timesheet();
// const {grammar, suggest} = funcDemo();

function Demo() {
  const [code, setCode] = useState(`  
  `.trim());
  const [output, setOutput] = useState<ParserResult<string>>();
  return <div style={{minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr', height: '75vh'}}>
    <DslEditor
      code={code}
      onChange={setCode}
      grammar={grammar}
      suggestions={suggest}
      onParsed={setOutput}/>
    <pre style={{overflow: 'auto'}}>{JSON.stringify(output, null, 2)}</pre>
  </div>;
}

export default Demo;
