import { useEffect, useState } from 'react';
import { CustomSyntaxHighlighter, type SyntaxElement } from './CustomSyntaxHighlighter.tsx';
import * as _ from 'remeda';

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function EditableSyntaxHighlighter(props: {
  suggestions: (type: string) => string[] | undefined,
  syntaxParser: (text: string) => SyntaxElement[],
  onChange?: (text: string) => void,
}) {
  const [code, setCode] = useState('fun foo{10  +2}');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [syntax, setSyntax] = useState<SyntaxElement[]>([]);

  function updateSuggestionsForCursorAt(cursorStart: number, _syntax = syntax): void {
    const suggestion = _.pipe(
      _syntax,
      _.filter(it => it.startOffset <= cursorStart && cursorStart <= it.startOffset + Math.max(it.text.length,it.expected?.length??0)), // syntax elements within cursor position
      _.map(syntax => {
        const clientSuggestions: string[] | undefined = props.suggestions(syntax.name);
        console.log({clientSuggestions}, `for ${syntax.name}`);
        return (clientSuggestions ?? [syntax.expected!].filter(it=>it)) // get suggestion for type
            .filter(suggestion =>
              suggestion.startsWith(syntax.text.substring(0, cursorStart - syntax.startOffset)) ||
              (syntax.expected && suggestion.startsWith(syntax.expected.substring(0, cursorStart - syntax.startOffset + 1))),
            ) // filter by prefix
            .filter(suggestion => suggestion.length !== cursorStart - syntax.startOffset);
        }, // reject fully written suggestions
      ),
      _.filter(suggestions => suggestions.length > 0), // find the first syntax element with suggestions
      _.take(1),
      _.flat(),
    );
    setSuggestions(suggestion ?? []);
  }

  useEffect(() => {
    setSyntax(props.syntaxParser(code));
  }, []);

  function updateSuggestions(code: string, e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setCode(code);
    props.onChange?.(code);
    try {
      const syntax: SyntaxElement[] = props.syntaxParser(code);
      updateSuggestionsForCursorAt(e.currentTarget.selectionStart, syntax);
      setSyntax(syntax);
    } catch (e) {
      setSyntax([]);
      console.warn(e);
    }
  }

  return <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
    <div style={{position: 'relative'}}>
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
          updateSuggestions(code, e);
        }}
      />
      <CustomSyntaxHighlighter
        syntax={syntax}
        code={code}
      />
    </div>
    <div style={{padding: 8}}>
      {uniq(suggestions).map((suggestion, idx) =>
        <button key={idx} onClick={() => {
          const currentTarget = document.querySelector('textarea')!;
          currentTarget.selectionStart = currentTarget.selectionEnd = currentTarget.value.length;
          updateSuggestions(code + suggestion, {currentTarget} as any);
        }}>&nbsp;{suggestion}&nbsp;</button>)}
      <pre>{JSON.stringify({
        cursor: document.querySelector('textarea')?.selectionStart,
        suggestions,

        syntax,
      }, null, 2)}</pre>
    </div>
  </div>;
}