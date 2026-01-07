import { DslEditor } from '../editor/DslEditor';
import './Demo.css';
import { useState } from 'react';
import { projectDsl } from './projectsDsl';
import dedent from 'string-dedent';
import { ParserSuccess } from '../parser/types';

// const {grammar, suggest} = timesheet();
// const {grammar, suggest} = funcDemo();
const grammar = projectDsl;

function Demo() {
    const [code, setCode] = useState(dedent`
      projects:
        p1
    `);
    const [output, setOutput] = useState<ParserSuccess<string>>();
    const [wrap, setWrap] = useState(false);
    return <div>
        <label><input type="checkbox" checked={wrap} onChange={e => setWrap(e.currentTarget.checked)}/>wrap</label>
        <div style={{
            minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr', height: '75vh',
        }}>
            <DslEditor
                wrap={wrap}
                code={code}
                onChange={setCode}
                grammar={grammar}
                onParsed={setOutput}/>
            <pre style={{overflow: 'auto'}}>{JSON.stringify(output, null, 2)}</pre>
        </div>
    </div>;
}

export default Demo;
