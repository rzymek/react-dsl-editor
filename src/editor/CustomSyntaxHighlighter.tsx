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
  let lastEndOffset = 0;
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
      {syntax.flatMap((element, idx) => {
        const styledToken =
          <span key={`token_${idx}`} className={[element.name].join(' ')}>
            {code.slice(element.startOffset, element.endOffset)}
          </span>;
        const prevEndOffset = lastEndOffset;
        if (element.endOffset !== undefined) {
          lastEndOffset = element.endOffset;
        }
        if (element.startOffset > prevEndOffset + 1) {
          return [<span key={`ignored_${idx}`}
                        className="__ignored__">{code.slice(prevEndOffset + 1, element.startOffset)}</span>, styledToken];
        } else {
          return [styledToken];
        }
      })}
    </pre>
  );
}