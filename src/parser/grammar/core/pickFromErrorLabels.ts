import {filter, firstBy, pipe} from "remeda";
import {ParserSuccess} from "../../types";

export function pickFromErrorLabels<T extends string>(children: ParserSuccess<T>[]) {
  return pipe(children,
    filter(it => it.errorLabel !== undefined),
    firstBy(it => -it.errorLabel!.got.length)
  );
}