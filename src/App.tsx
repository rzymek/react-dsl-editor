import { EditableSyntaxHighlighter } from './editor/EditableSyntaxHighlighter.tsx';
import type { SyntaxElement } from './editor/CustomSyntaxHighlighter.tsx';
import { Parser } from './parser/Parser.ts';
import { funcParser } from './example/funcParser.ts';
import { syntaxParser } from './glue/syntaxParser.ts';
import './App.css';
import { useState } from 'react';

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

const parser = new Parser(funcParser);

function syntaxer(text: string): SyntaxElement[] {
  const syntaxElements = syntaxParser(parser.parse(text));
  if (syntaxElements[syntaxElements.length - 1]?.endOffset !== text.length) {
    const startOffset: number = syntaxElements[syntaxElements.length - 1]?.endOffset ?? 0;
    syntaxElements.push({
      name: 'error',
      text: text.substring(startOffset),
      startOffset,
      endOffset: text.length,
    });
  }
  return syntaxElements;
}

function App() {
  const [code, setCode] = useState('');
  return <div>
    <EditableSyntaxHighlighter suggestions={suggestions} syntaxParser={syntaxer} onChange={setCode}/>
    <pre>{JSON.stringify(parser.parse(code), null, 2)}</pre>
  </div>;
}

export default App;
