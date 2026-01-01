import { ASTNode, isParserSuccess } from '../parser';
import type { SyntaxElement } from '../editor/SyntaxHighlighter';
import * as _ from 'remeda';

function syntaxForParserResult<T extends string>(ast: ASTNode<T>, offset: number, result: SyntaxElement<T>[] = []): SyntaxElement<T>[] {
  if (ast.children) {
    for (const child of ast.children) {
      syntaxForParserResult(child, offset, result);
      offset += isParserSuccess(child) ? child.text.length : 0;
    }
  } else {
    if (isParserSuccess(ast)) {
      result.push({
        name: ast.type,
        text: ast.text,
        startOffset: offset,
      });
    }
  }
  return result;
}

function removeOverlap<T>(syntax: SyntaxElement<T>[]) {
  return syntax.flatMap((element, index, arr) => {
    const prev = arr[index - 1] ?? {text: '', startOffset: 0, name: 'error'};
    const prevEnd = prev.startOffset + prev.text.length;
    if (element.startOffset < prevEnd) {
      return [];
    }
    return [element];
  });
}

export function textSyntax<T extends string>(ast: ASTNode<T>, text: string): SyntaxElement<T>[] {
  const syntaxElements = syntaxForParserResult<T>(ast, 0);
  const syntaxEndOffset = _.pipe(
    syntaxElements,
    _.map(it => it.startOffset + it.text.length),
    _.sortBy(it => it),
    _.last(),
    it => it ?? 0,
  );
  if (syntaxEndOffset < text.length) {
    const startOffset = syntaxEndOffset;
    syntaxElements.push({
      name: 'error',
      text: text.substring(startOffset),
      startOffset,
    });
  }
  return removeOverlap(syntaxElements);
}