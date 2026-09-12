import { messageTests } from "./message";
import { translateTests } from "./translate";

const allTests = [messageTests, translateTests];

for (const testSuite of allTests) {
  testSuite();
}
