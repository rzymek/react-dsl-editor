import { isParserError, isParserSuccess, type ParserResult } from '../parser/types.ts';
import type { SyntaxElement } from '../editor/CustomSyntaxHighlighter.tsx';
import { last } from 'remeda';

function _syntaxParser(ast: ParserResult, offset: number, result: SyntaxElement[] = []): SyntaxElement[] {
  if (isParserSuccess(ast) && ast.children) {
    for (const child of ast.children) {
      _syntaxParser(child, offset, result);
      offset += isParserSuccess(child) ? child.text.length : 0;
    }
  } else {
    const text: string = isParserSuccess(ast) ? ast.text : '';
    result.push({
      name: ast.type,
      text,
      expected: (isParserError(ast) && typeof (ast.error.expected) === 'string') ? ast.error.expected : undefined,
      startOffset: offset,
      endOffset: offset + text.length,
    });
  }
  return result;
}

export function syntaxParser(ast: ParserResult, text: string): SyntaxElement[] {
  const syntaxElements = _syntaxParser(ast, 0);
  const syntaxEndOffset = last(syntaxElements)?.endOffset ?? 0;
  if (syntaxEndOffset < text.length) {
    const startOffset = syntaxEndOffset;
    syntaxElements.push({
      name: 'error',
      text: text.substring(startOffset),
      startOffset,
      endOffset: text.length,
    });
  }
  return syntaxElements;
}