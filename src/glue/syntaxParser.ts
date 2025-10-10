import type { ParserSuccess } from '../parser/types.ts';
import type { SyntaxElement } from '../editor/CustomSyntaxHighlighter.tsx';


function _syntaxParser(ast: ParserSuccess, offset: number, result: SyntaxElement[] = []): SyntaxElement[] {
  if (ast.children) {
    for (const child of ast.children) {
      _syntaxParser(child, offset, result);
      offset += child.text.length;
    }
  }else{
    result.push({
      name: ast.type,
      text: ast.text,
      startOffset: offset,
      endOffset: offset + ast.text.length,
    });
  }
  return result;
}

export function syntaxParser(ast: ParserSuccess): SyntaxElement[] {
  return _syntaxParser(ast, 0);
}