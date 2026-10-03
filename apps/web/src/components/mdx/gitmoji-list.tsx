import { gitmojis } from "gitmojis";

// The published list, the same version the gitmoji plugin pins, so a reader
// never picks an emoji the commit hook would refuse. Reading `master` instead
// showed emojis that are merged but not released yet.
export function GitmojiList() {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr>
            <th className="border border-border bg-card px-3 py-2 text-left font-semibold text-sm w-16">
              Emoji
            </th>
            <th className="border border-border bg-card px-3 py-2 text-left font-semibold text-sm">
              Code
            </th>
            <th className="border border-border bg-card px-3 py-2 text-left font-semibold text-sm">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {gitmojis.map((gitmoji) => (
            <tr key={gitmoji.code}>
              <td className="border border-border px-3 py-2 text-center text-lg">
                {gitmoji.emoji}
              </td>
              <td className="border border-border px-3 py-2 text-sm">
                <code className="bg-card border border-border px-1.5 py-0.5 rounded text-xs font-mono">
                  {gitmoji.code}
                </code>
              </td>
              <td className="border border-border px-3 py-2 text-sm">
                {gitmoji.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
