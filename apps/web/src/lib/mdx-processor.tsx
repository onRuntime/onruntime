import type { Root, Heading, Text, PhrasingContent } from "mdast";
import { Link } from "@onruntime/translations/next";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import React from "react";

import {
  Cards,
  Card,
  Callout,
  Files,
  File,
  Folder,
  Accordions,
  Accordion,
  GitmojiList,
  icons,
} from "@/components/mdx";
import { cn } from "@/lib/utils";

export interface HeadingData {
  id: string;
  title: string;
  level: number;
}

export interface ReadingTime {
  text: string;
  minutes: number;
  words: number;
}

export interface ProcessedMDX {
  content: React.ReactElement;
  headings: HeadingData[];
  readingTime: ReadingTime;
}

function remarkExtractHeadings(headings: HeadingData[]) {
  return () => (tree: Root, file: VFile) => {
    visit(tree, "heading", (node: Heading) => {
      const textContent = node.children
        .map((child: PhrasingContent) => {
          if (child.type === "text") return (child as Text).value;
          return "";
        })
        .join("");

      if (textContent) {
        const id = textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        headings.push({
          id,
          title: textContent,
          level: node.depth,
        });

        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        (node.data.hProperties as Record<string, string>).id = id;
      }
    });

    file.data = file.data || {};
    file.data.headings = headings;
  };
}

export const mdxComponents = {
  // Headings with anchor links
  h1: ({
    children,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      id={id}
      className="text-4xl font-bold mb-4 mt-8 first:mt-0 scroll-mt-20"
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({
    children,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={id}
      className="text-3xl font-bold mb-3 mt-8 scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),

  h3: ({
    children,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={id}
      className="text-2xl font-semibold mb-3 mt-6 scroll-mt-20"
      {...props}
    >
      {children}
    </h3>
  ),

  h4: ({
    children,
    id,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      id={id}
      className="text-xl font-semibold mb-2 mt-4 scroll-mt-20"
      {...props}
    >
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-base leading-7 mb-4 last:mb-0" {...props}>
      {children}
    </p>
  ),

  // Links
  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith("http") || href?.startsWith("//");
    const isHash = href?.startsWith("#");

    if (isHash) {
      return (
        <a
          href={href}
          className="text-primary hover:underline font-medium"
          {...props}
        >
          {children}
        </a>
      );
    }

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href || "#"}
        className="text-primary hover:underline font-medium"
      >
        {children}
      </Link>
    );
  },

  // Lists
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-inside mb-4 space-y-1 text-base [&>li]:pl-0"
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-inside mb-4 space-y-1 text-base [&>li]:pl-0"
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      className="text-base leading-7 [&>ul]:mt-2 [&>ol]:mt-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>ul]:ml-4 [&>ol]:ml-4 [&>p]:inline [&>p]:mb-0"
      {...props}
    >
      {children}
    </li>
  ),

  // Code
  code: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className?.includes("language-");

    if (isInline) {
      return (
        <code
          className="bg-card border border-border px-1.5 py-0.5 rounded text-[0.85em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className={cn("font-mono text-sm", className)} {...props}>
        {children}
      </code>
    );
  },

  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-card border border-border p-4 rounded-lg overflow-x-auto mb-4 text-sm max-w-full"
      {...props}
    >
      {children}
    </pre>
  ),

  // Blockquotes
  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary/25 pl-4 my-6 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-border my-8" {...props} />
  ),

  // Tables
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="w-full border-collapse border border-border"
        {...props}
      >
        {children}
      </table>
    </div>
  ),

  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border border-border bg-card px-3 py-2 text-left font-semibold text-sm"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-border px-3 py-2 text-sm" {...props}>
      {children}
    </td>
  ),

  // Images
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-full h-auto rounded-md my-4 max-h-[500px] object-cover"
      {...props}
    />
  ),

  // Strong and emphasis
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold" {...props}>
      {children}
    </strong>
  ),

  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),

  // Fumadocs-inspired components
  Cards,
  Card,
  Callout,
  Files,
  File,
  Folder,
  Accordions,
  Accordion,
  GitmojiList,

  // Icons for use in MDX
  ...icons,
};

export async function processMDX(
  source: string,
  locale: string = "en",
): Promise<ProcessedMDX> {
  const headings: HeadingData[] = [];

  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkExtractHeadings(headings)],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: ["anchor"],
              },
            },
          ],
        ],
      },
    },
  });

  const words = source.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  const minReadText = locale === "fr" ? "min de lecture" : "min read";
  const readingTime: ReadingTime = {
    text: `${minutes} ${minReadText}`,
    minutes,
    words,
  };

  return {
    content,
    headings,
    readingTime,
  };
}
