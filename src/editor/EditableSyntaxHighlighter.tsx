import { useEffect, useState } from 'react';
import { CustomSyntaxHighlighter, type SyntaxElement } from './CustomSyntaxHighlighter.tsx';

export function EditableSyntaxHighlighter(props: {
  suggestions: (type: string, text: string, offset: number) => string[],
  syntaxParser: (text: string) => SyntaxElement[],
}) {
  const [code, setCode] = useState('fun foo{10  +2}');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [syntax, setSyntax] = useState<SyntaxElement[]>([]);

  function updateSuggestionsForCursorAt(cursorStart: number, _syntax = syntax): void {
    console.log(`updateSuggestionsForCursorAt(${cursorStart})`);
    const element = _syntax
      .find(it => it.startOffset <= cursorStart && cursorStart <= it.endOffset);
    const foo: string[] = [];
    if (element) {
      foo.push(...props.suggestions(
        element.name,
        element.text,
        cursorStart - element.startOffset,
      ));
    }
    const nextElement = _syntax.find(it => cursorStart == it.startOffset && cursorStart == it.endOffset);
    if (nextElement) {
      foo.push(...props.suggestions(
        nextElement.name,
        nextElement.text,
        cursorStart - nextElement.startOffset,
      ));
    }
    setSuggestions(foo);
  }

  useEffect(() => {
    setSyntax(props.syntaxParser(code));
  }, []);

  return <div>
    <div style={{position: 'relative', width: 800, height: 600, border: '1px solid red'}}>
      <textarea
        style={{
          position: 'absolute',
          inset: 0,
          fontSize: '1em',
          fontFamily: 'monospace',
          color: 'transparent',
          background: 'transparent',
          caretColor: 'black',
          border: 'none',
          resize: 'none',
          overflow: 'auto',
          padding: 3,
        }}
        value={code}
        onSelect={e => {
          const target = e.target as HTMLTextAreaElement;
          const cursorStart = target.selectionStart;
          updateSuggestionsForCursorAt(cursorStart);
        }}
        onChange={(e) => {
          const code = e.currentTarget.value;
          setCode(code);
          try {
            const syntax: SyntaxElement[] = props.syntaxParser(code);
            updateSuggestionsForCursorAt(e.currentTarget.selectionStart, syntax);
            setSyntax(syntax);
          } catch (e) {
            setSyntax([]);
            console.warn(e);
          }
        }}
      />
      <CustomSyntaxHighlighter
        syntax={syntax}
        code={code}
      />
    </div>
    <pre>{JSON.stringify({
      suggestions,
      syntax,
    }, null, 2)}</pre>
  </div>;
}