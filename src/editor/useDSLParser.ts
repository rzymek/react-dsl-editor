import {useMemo,} from 'react';
import {DSLParser, GrammarNode} from "../parser";

export function useDSLParser<T extends string>({grammar, validate}: {
  grammar: GrammarNode<T>,
  validate?: (node: T, text: string) => string | undefined,
}) {
  return useMemo(() => validate ? new class ValidatingParser extends DSLParser<T> {
    constructor() {
      super(grammar);
    }

    protected validate(node: T, text: string): string | undefined {
      return validate(node, text);
    }
  } : new DSLParser(grammar), [grammar, validate]);
}