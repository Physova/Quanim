import * as React from "react";

interface MDXContentProps {
  children: React.ReactNode;
}

export function MDXContent({ children }: MDXContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      {children}
    </div>
  );
}
