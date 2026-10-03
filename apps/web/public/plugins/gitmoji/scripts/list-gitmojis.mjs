#!/usr/bin/env node
// Prints the official gitmoji list, which the skill reads before choosing an
// emoji. The list is the `gitmojis` package, published from
// carloscuesta/gitmoji: there is no copy of it in this plugin.
//
//   node scripts/list-gitmojis.mjs

const { gitmojis } = await import("gitmojis").catch(() => {
  console.error(
    "The gitmojis package is not installed. Run `npm install` in the plugin root.",
  );
  process.exit(1);
});

const width = Math.max(...gitmojis.map((gitmoji) => gitmoji.code.length));

for (const gitmoji of gitmojis) {
  console.log(
    `${gitmoji.emoji} ${gitmoji.code.padEnd(width)}  ${gitmoji.description}`,
  );
}
