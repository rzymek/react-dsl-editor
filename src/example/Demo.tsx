import { DslEditor } from '../editor/DslEditor';
import './Demo.css';
import type { ParserResult } from '../parser';
import { useState } from 'react';
//import { timesheet } from './timesheet';
import { funcDemo } from './funcDemo';

// const {grammar, suggest} = timesheet();

const {grammar, suggest} = funcDemo();

function Demo() {
  const [code, setCode] = useState(`  
  `.trim());
  const [output, setOutput] = useState<ParserResult<string>>();
  const [wrap, setWrap] = useState(false);
  return <div>
    <label><input type="checkbox" checked={wrap} onChange={e => setWrap(e.currentTarget.checked)}/>wrap</label>
    <div style={{minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr', height: '75vh'}}>
      <DslEditor
        wrap={wrap}
        code={code}

        onChange={setCode}
        grammar={grammar}
        suggestions={suggest}
        styles={{
          fun: {color: 'yellowgreen', fontStyle: 'italic'}
        }}
        onParsed={setOutput}/>
      <pre style={{overflow: 'auto'}}>{JSON.stringify(output, null, 2)}</pre>
    </div>
  </div>;
}

export default Demo;
