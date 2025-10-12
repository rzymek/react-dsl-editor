import { EditableSyntaxHighlighter } from './editor/EditableSyntaxHighlighter.tsx';
import { funcParser } from './example/funcParser.ts';
import './App.css';
import { useState } from 'react';
import type { ParserResult } from './parser/types.ts';

function suggestions(type: string) {
  if (type == 'keyword') {
    return ['fun'];
  } else if (type === 'identifier') {
    return ['foo', 'bar', 'baz'];
  } else if (type === 'space') {
    return [' '];
  } else if (type === 'rational') {
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  }
}

function App() {
  const [code, setCode] = useState(`
    fun foo{ 12  +3}
  `.trim());
  const [output, setOutput] = useState<ParserResult>();
  return <div style={{minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
    <EditableSyntaxHighlighter
      code={code}
      onChange={setCode}
      grammar={funcParser}
      suggestions={suggestions}
      onParsed={setOutput}/>
    <pre>{JSON.stringify(output, null, 2)}</pre>
  </div>;
}

export default App;
