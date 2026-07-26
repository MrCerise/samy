import { Container, Text } from "./components";

export default function errorUI(text: string) {
  return new Container().addTextDisplayComponents(Text(text));
}
