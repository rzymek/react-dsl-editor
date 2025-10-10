import { isParserSuccess, type ParserSuccess, type RecoverableError } from '../parser/types.ts';
import type { SyntaxElement } from '../editor/CustomSyntaxHighlighter.tsx';


function _syntaxParser(ast: ParserSuccess | RecoverableError, offset: number, result: SyntaxElement[] = []): SyntaxElement[] {
  if (isParserSuccess(ast) && ast.children) {
    for (const child of ast.children) {
      _syntaxParser(child, offset, result);
      offset += isParserSuccess(child) ? child.text.length : 0;
    }
  } else {
    result.push({
      name: ast.type,
      text: isParserSuccess(ast) ? ast.text : '',
      startOffset: offset,
      endOffset: offset + (isParserSuccess(ast) ? ast.text.length : 0),
    });
  }
  return result;
}

export function syntaxParser(ast: ParserSuccess|RecoverableError): SyntaxElement[] {
  return _syntaxParser(ast, 0);
}