import {CSTNode} from "./CSTNode";
import {DSLError} from "./DSLParser";

export function getErrors<T extends string>(node: CSTNode<T>, depth = 1): DSLError[] {
  const childErrors = node.children?.flatMap(it => getErrors(it, depth + 1)) ?? [];
  if (node.recoverableError) {
    const error: DSLError = {
      start: node.offset,
      end: Math.max(node.end, node.offset + 1),
      message: `${node.grammar.type} ${node.text}`,
      depth,
    };
    return [
      error,
      ...childErrors,
    ];
  } else {
    return childErrors;
  }
}