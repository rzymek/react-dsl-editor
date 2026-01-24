import {alternative, pattern} from "../core";
import {eof} from "./eof";

export const newline = alternative(pattern(/\n/), eof);
newline.type='newline' as never;
