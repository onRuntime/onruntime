import React from "react";

interface JobContentProps {
  content: string;
  className?: string;
}

const JobContent: React.FC<JobContentProps> = ({ content, className = "" }) => {
  return (
    <div
      className={`
        [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-foreground
        [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-foreground
        [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground
        [&_p]:text-base [&_p]:mb-4 [&_p]:text-muted-foreground
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-muted-foreground [&_ul]:text-base
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-muted-foreground [&_ol]:text-base
        [&_li]:mb-1 [&_li]:text-base
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_em]:italic
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground
        [&_code]:bg-card [&_code]:border [&_code]:border-border [&_code]:text-foreground [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[0.85em]
        [&_hr]:border-border [&_hr]:my-8
        [&_a]:text-primary hover:[&_a]:underline
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default JobContent;