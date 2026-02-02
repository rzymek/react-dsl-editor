import {error, GrammarNode, ParserContext, ParserResult} from "../../types";

export const strictInitialContext: ParserContext<string> = {
  handleTerminalError(text: string, context: ParserContext<string>, grammar: GrammarNode<string>): ParserResult<string> {
    return error({
      grammar,
      offset: 0,
      expected: grammar.suggestions().map(it=>it.text),
      got: text,
      path: context.path,
    })
  },
  path: []
};