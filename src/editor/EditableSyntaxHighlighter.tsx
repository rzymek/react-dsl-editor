import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomSyntaxHighlighter, type SyntaxElement } from './CustomSyntaxHighlighter.tsx';
import * as _ from 'remeda';
import { Parser } from '../parser/Parser.ts';
import { type Parse, type ParserResult } from '../parser/types.ts';
import { syntaxParser } from '../glue/syntaxParser.ts';

export function EditableSyntaxHighlighter(
  {
    code,
    onChange,
    onParsed,
    grammar,
    suggestions: clientSuggestions,
  }: {
    code: string,
    onChange: (text: string) => void,
    onParsed?: (ast: ParserResult) => void,
    grammar: Parse,
    suggestions?: (type: string) => string[] | undefined,
  }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [syntax, setSyntax] = useState<SyntaxElement[]>([]);
  const parser = useRef<Parser>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const updateSuggestionsForSyntax = useCallback((_syntax: SyntaxElement[]) => {
    const cursorStart = textarea.current?.selectionStart ?? 0;
    const suggestion = _.pipe(
      _syntax,
      _.filter(it => it.startOffset <= cursorStart && cursorStart <= Math.max(it.endOffset, it.startOffset + (it.expected ?? '').length)), // syntax elements within cursor position
      _.map(syntax => {
          const suggestions = syntax.expected ? [syntax.expected] : clientSuggestions?.(syntax.name) ?? [];
          return suggestions // get suggestion for type
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
    setSuggestions(suggestion);
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
    const syntax = syntaxParser(ast, code);
    updateSuggestionsForSyntax(syntax);
    setSyntax(syntax);
  }, [code, onParsed, updateSuggestionsForSyntax]);

  return <div style={{display: 'grid', gridTemplateRows: '1fr auto'}}>
    <div style={{position: 'relative', border: '1px solid black', overflow: 'hidden'}}>
      <textarea
        ref={textarea}
        spellCheck={false}
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
      />
      <CustomSyntaxHighlighter syntax={syntax}/>
    </div>
    <div style={{display: 'flex', gap: 4, padding: '4px 0', overflowY: 'auto'}}>
      {_.pipe(
        suggestions,
        _.unique(),
        _.map((suggestion, idx) =>
          <button key={idx} onClick={() => onChange(code + suggestion)}>
            &nbsp;{suggestion}&nbsp;
          </button>),
      )}
      {/*<pre>{JSON.stringify({cursor: textarea.current?.selectionStart, suggestions, syntax}, null, 2)}</pre>*/}
    </div>
  </div>;
}