import {DslEditor} from '../editor/DslEditor';
import './Demo.css';
import type {ASTNode} from '../parser';
import {useState} from 'react';
import {projectDsl} from './projectsDsl';
import {isEmpty} from "remeda";

// const {grammar, suggest} = timesheet();
// const {grammar, suggest} = funcDemo();
const {grammar, suggest} = projectDsl;

function Demo() {
    const [code, setCode] = useState(`  
  `.trim());
    const [output, setOutput] = useState<ASTNode<string>>();
    const [wrap, setWrap] = useState(false);
    return <div>
        <label><input type="checkbox" checked={wrap} onChange={e => setWrap(e.currentTarget.checked)}/>wrap</label>
        <div style={{
            minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr', height: '75vh',
            backgroundColor: !isEmpty(output?.errors ?? []) ? '#f88' : '#afa'
        }}>
            <DslEditor
                wrap={wrap}
                code={code}
                onChange={setCode}
                grammar={grammar}
                suggestions={suggest}
                styles={{}}
                onParsed={setOutput}/>
            <pre style={{overflow: 'auto'}}>{JSON.stringify(output, null, 2)}</pre>
        </div>
    </div>;
}

export default Demo;
