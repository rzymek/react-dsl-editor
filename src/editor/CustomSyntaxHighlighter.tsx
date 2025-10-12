export interface SyntaxElement {
  name: string,
  text: string,
  expected?: string | undefined,
  startOffset: number,
  endOffset: number,
}

export function CustomSyntaxHighlighter({syntax = []}: {
  syntax: SyntaxElement[];
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
            {element.text}
          </span>,
      )}
    </pre>
  );
}