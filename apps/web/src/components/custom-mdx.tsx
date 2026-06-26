import React from "react"
import { Link } from "@onruntime/translations/next"

const components = {
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mb-4 text-foreground" {...props} />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-semibold mb-3 mt-6 text-foreground" {...props} />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mb-2 mt-4 text-foreground" {...props} />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="text-base mb-4 text-muted-foreground" {...props} />
  ),
  a: ({ href, ...props }: React.HTMLProps<HTMLAnchorElement>) => (
    <Link href={href || "#"} className="text-primary hover:underline" {...props} />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-4 text-muted-foreground text-base" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-4 text-muted-foreground text-base" {...props} />
  ),
  li: (props: React.HTMLProps<HTMLLIElement>) => <li className="mb-1 text-base" {...props} />,
  strong: (props: React.HTMLProps<HTMLElement>) => <strong className="font-semibold text-foreground" {...props} />,
  em: (props: React.HTMLProps<HTMLElement>) => <em className="italic" {...props} />,
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />
  ),
  code: (props: React.HTMLProps<HTMLElement>) => (
    <code className="bg-card border border-border text-foreground px-1.5 py-0.5 rounded font-mono text-[0.85em]" {...props} />
  ),
  hr: (props: React.HTMLProps<HTMLHRElement>) => <hr className="border-border my-8" {...props} />,
}

export interface MDXProps {
  components?: Record<string, React.ComponentType<React.HTMLAttributes<HTMLElement>>>
  [key: string]: unknown
}

interface CustomMDXProps {
  children: React.ReactElement<MDXProps>
}

export function CustomMDX({ children }: CustomMDXProps) {
  return (
    <div className="mdx-content">
      {React.cloneElement(children, {
        components: {
          ...(children.props.components || {}),
          ...components,
        },
      })}
    </div>
  )
}

