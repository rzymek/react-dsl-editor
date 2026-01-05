import { pattern } from '../core/pattern';
import { optional } from '../core/optional';

export const ws = optional(pattern(/\s+/))
