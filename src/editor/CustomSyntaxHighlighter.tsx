export interface SyntaxElement {
  endOffset: number;
  startOffset: number;
  name: string;
  text: string,
}

export function CustomSyntaxHighlighter({syntax = [], code = ''}: {
  syntax: SyntaxElement[];
  code: string
}) {
  return (
    <pre style={{
      pointerEvents: 'none', // Let textarea capture input
      margin: 0,
      padding: 3,
      inset: 0,
      position: 'absolute',
      fontSize: '1em',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
    }}>
      {syntax.flatMap((element, idx) =>
        <span key={`token_${idx}`} className={[element.name].join(' ')}>
            {code.slice(element.startOffset, element.endOffset)}
          </span>,
      )}
    </pre>
  );
}