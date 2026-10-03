import { gitmojiTests } from "./validation/gitmoji";
import { localesTests } from "./validation/locales";

const appTests = [
  localesTests,
  gitmojiTests,
];

for (const appTest of appTests) {
  appTest();
}
