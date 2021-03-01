import { lexer } from "./lexer";
import { parser } from "./parser";

export function convert(data: string) {
  const tokens = lexer(data);
  return parser(tokens);
}
