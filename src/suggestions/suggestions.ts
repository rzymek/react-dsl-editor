import * as _ from 'remeda';
import { unique } from 'remeda';
import { ASTNode } from '../parser';
import { nodeTypesAt } from './nodeTypesAt';

export interface Suggestion<T> {
  text: string,
  type: T,
}

export function suggestionsFromErrors<T extends string>(node: ASTNode<T>, cursorPositon: number): Suggestion<T>[] {
  return _.pipe(node.errors,
    _.flatMap(error => {
      if (typeof error.expected !== 'string') {
        return [];
      }
      if (error.offset <= cursorPositon && cursorPositon <= error.offset + error.expected.length) {
        return [{text: error.expected, type: error.type}];
      }
      return [];
    }),
    _.take(1),
  );
}

export function getSuggestions<T extends string>(ast: ASTNode<T>, cursorPositon: number, clientSuggestions: (type: T) => string[] | undefined) {
  const nodes = nodeTypesAt(ast, cursorPositon);
  const types = nodes
    .flatMap(node => {
      const prefix = ast.text.substring(node.offset, cursorPositon);
      const suggestionResponse = clientSuggestions(node.type);
      if (suggestionResponse !== undefined) {
        return suggestionResponse.filter(s => s.startsWith(prefix));
      } else {
        return suggestionsFromErrors<T>(node, cursorPositon)
          .map(it=>it.text)
          .filter(s => s.startsWith(prefix));
      }
    });
  return unique(types);
}