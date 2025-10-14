export interface SyntaxElement<T> {
  name: T | 'error',
  text: string,
  expected?: string | undefined,
  startOffset: number,
  endOffset: number,
}

export function SyntaxHighlighter<T>({syntax = []}: {
  syntax: SyntaxElement<T>[];
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
      {syntax.map((element, idx) =>
        <span key={`token_${idx}`} className={[element.name].join(' ')}>
            {element.text}
          </span>,
      )}
    </pre>
  );
}