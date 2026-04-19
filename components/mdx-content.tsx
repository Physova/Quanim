import * as React from "react";

interface MDXContentProps {
  children: React.ReactNode;
}

export function MDXContent({ children }: MDXContentProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:tracking-tighter prose-headings:uppercase prose-headings:text-white prose-p:text-white/60 prose-p:leading-relaxed prose-strong:text-white prose-a:text-white/80 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-white prose-blockquote:border-white/20 prose-blockquote:text-white/50 prose-code:text-white/70 prose-hr:border-white/10">
      {children}
    </div>
  );
}
