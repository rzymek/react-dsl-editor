import { isParserError, isParserSuccess, type ParserResult } from '../parser/types';
import type { SyntaxElement } from '../editor/SyntaxHighlighter';
import { last } from 'remeda';

function syntaxForParserResult<T extends string>(ast: ParserResult<T>, offset: number, result: SyntaxElement<T>[] = []): SyntaxElement<T>[] {
  if (isParserSuccess(ast) && ast.children) {
    for (const child of ast.children) {
      syntaxForParserResult(child, offset, result);
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

export function textSyntax<T extends string>(ast: ParserResult<T>, text: string): SyntaxElement<T>[] {
  const syntaxElements = syntaxForParserResult<T>(ast, 0);
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