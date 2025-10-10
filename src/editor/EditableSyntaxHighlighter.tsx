import { useMemo, useState } from 'react';
import { CustomSyntaxHighlighter, type SyntaxElement } from './CustomSyntaxHighlighter.tsx';

export function EditableSyntaxHighlighter(props: {
  suggestions: (text: string) => string[],
  syntaxParser: (text: string) => SyntaxElement[],
}) {
  const [code, setCode] = useState('fun foo{10  +2}');
  const [, setSuggestions] = useState<string[]>([]);
  const syntax = useMemo(() => {
    try {
      return props.syntaxParser(code);
    } catch (e) {
      console.warn(e);
      return [];
    }
  }, [code]);
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
        onChange={(e) => {
          setSuggestions(props.suggestions(e.currentTarget.value));
          setCode(e.currentTarget.value);
        }}
      />
      <CustomSyntaxHighlighter
        syntax={syntax}
        code={code}
      />
    </div>
    <pre>{JSON.stringify(syntax, null, 2)}</pre>
  </div>;
}