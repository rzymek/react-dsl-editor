import { EditableSyntaxHighlighter } from './editor/EditableSyntaxHighlighter.tsx';
import { funcParser } from './example/funcParser.ts';
import './App.css';
import { useState } from 'react';

function suggestions(type: string) {
  console.log('suggestions', type);
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
  const [code, setCode] = useState('fun foo{ 12  +3}');
  return <div style={{minHeight: '50vh', display: 'grid', gridTemplateColumns: '1fr'}}>
    <EditableSyntaxHighlighter suggestions={suggestions} code={code} onChange={setCode} grammar={funcParser}/>
  </div>;
}

export default App;
