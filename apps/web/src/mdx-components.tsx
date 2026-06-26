import type { MDXComponents } from "mdx/types"
import { Link } from "@onruntime/translations/next"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children }) => <h1 className="text-4xl font-bold mb-4 text-foreground">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
    p: ({ children }) => <p className="text-base mb-4 text-muted-foreground">{children}</p>,
    a: ({ href, children }) => (
      <Link href={href || "#"} className="text-primary hover:underline">
        {children}
      </Link>
    ),
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-muted-foreground">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-muted-foreground">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{children}</blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-card border border-border text-foreground px-1.5 py-0.5 rounded font-mono text-[0.85em]">{children}</code>
    ),
    hr: () => <hr className="border-border my-8" />,
  }
}
