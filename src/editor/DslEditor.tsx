import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SyntaxElement, SyntaxHighlighter } from './SyntaxHighlighter';
import { Parser, type Parse, type ParserResult } from '../parser';
import { textSyntax } from '../syntax/textSyntax';
import { getSuggestions } from './getSuggestions';
import { SuggestionsView } from './SuggestionsView';
import { unique } from 'remeda';

function SuggestionsMenu({suggestions,onSelect}: { suggestions: string[], onSelect: (suggestion:string) => void }) {
  return <div style={{position: 'absolute', top: 10, left: 10, border: '1px solid black', minWidth: 200}}>
    {suggestions.map((suggestion, idx) =>
      <div key={idx} onClick={() => onSelect(suggestion)} style={{cursor: 'pointer'}}>
        &nbsp;{suggestion}&nbsp;
      </div>)}
  </div>
}

export function DslEditor<T extends string>(
  {
    code,
    onChange,
    onParsed,
    grammar,
    wrap = false,
    suggestions: clientSuggestions,
  }: {
    code: string,
    onChange: (text: string) => void,
    onParsed?: (ast: ParserResult<T>) => void,
    grammar: Parse<T>,
    wrap?: boolean,
    suggestions?: (type: T | 'error') => string[] | undefined,
  }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [syntax, setSyntax] = useState<SyntaxElement<T>[]>([]);
  const parser = useRef<Parser<T>>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const updateSuggestionsForSyntax = useCallback((_syntax: SyntaxElement<T>[]) => {
    const cursorStart = textarea.current?.selectionStart ?? 0;
    const suggestion = getSuggestions(_syntax, cursorStart, clientSuggestions);
    setSuggestions(unique(suggestion));
  }, [clientSuggestions]);

  const updateSuggestions = useMemo(() => function updateSuggestions() {
    return updateSuggestionsForSyntax(syntax);
  }, [syntax, updateSuggestionsForSyntax]);

  useEffect(() => {
    parser.current = new Parser(grammar);
  }, [grammar]);

  useEffect(() => {
    if (!parser.current) {
      return;
    }
    const ast = parser.current.parse(code);
    onParsed?.(ast);
    const syntax = textSyntax(ast, code);
    updateSuggestionsForSyntax(syntax);
    setSyntax(syntax);
  }, [code, onParsed, updateSuggestionsForSyntax]);

  const highlighterRef = useRef<HTMLPreElement>(null);
  const handleScroll = useCallback(() => {
    if (textarea.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textarea.current.scrollTop;
      highlighterRef.current.scrollLeft = textarea.current.scrollLeft;
    }
  }, []);

  return <div style={{display: 'grid', gridTemplateRows: '1fr auto', flex: 1, width: '100%', height: '100%'}}>
    <div style={{position: 'relative', border: '1px solid black', overflow: 'hidden'}}>
      <textarea
        ref={textarea}
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
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
        onSelect={updateSuggestions}
        onChange={useCallback((e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value), [onChange])}
        onScroll={handleScroll}
      />
      <SyntaxHighlighter syntax={syntax} ref={highlighterRef} wrap={wrap}/>
      <SuggestionsMenu suggestions={suggestions} onSelect={suggestion => onChange(code + suggestion)}/>
    </div>
    <SuggestionsView suggestions={suggestions} onSelect={suggestion => onChange(code + suggestion)}/>
  </div>;
}