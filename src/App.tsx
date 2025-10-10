import { EditableSyntaxHighlighter } from './editor/EditableSyntaxHighlighter.tsx';
import type { SyntaxElement } from './editor/CustomSyntaxHighlighter.tsx';
import { Parser } from './parser/Parser.ts';
import { funcParser } from './example/funcParser.ts';
import { syntaxParser } from './glue/syntaxParser.ts';
import './App.css'

function suggestion(_: string):string[] {
  return ['foo', 'bar', 'baz'];
}

const parser = new Parser(funcParser)
function syntaxer(text: string): SyntaxElement[] {
  const syntaxElements = syntaxParser(parser.parse(text));
  if(syntaxElements[syntaxElements.length-1]?.endOffset !== text.length) {
    const startOffset: number = syntaxElements[syntaxElements.length-1]?.endOffset ?? 0;
    syntaxElements.push({
      name: 'error',
      startOffset,
      endOffset: text.length,
      text: text.substring(startOffset),
    })
  }
  return syntaxElements;
}

function App() {
  return <div>
    <EditableSyntaxHighlighter suggestions={suggestion} syntaxParser={syntaxer} />
  </div>}

export default App
