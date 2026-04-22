"use client";

import * as React from "react";
import { useMDXComponents } from "@/mdx-components";
import { MDXProvider } from "@mdx-js/react";
import { SelectionFeedback } from "@/components/content/selection-feedback";
import { useRef, useEffect } from "react";

interface MDXContentProps {
  children: React.ReactNode;
  slug: string;
}

export function MDXContent({ children, slug }: MDXContentProps) {
  const mdxComponents = useMDXComponents({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Find all paragraphs with our marker class
      const paragraphs = containerRef.current.querySelectorAll(".mdx-para");
      paragraphs.forEach((p, index) => {
        // Assign a stable-ish ID based on index
        // This is safe for the selection feedback trigger
        if (!p.hasAttribute("data-para-id")) {
          p.setAttribute("data-para-id", `para-${index}`);
        }
      });
    }
  }, [children]);
  
  return (
    <MDXProvider components={mdxComponents}>
      <div ref={containerRef} className="prose-editorial relative">
        {children}
        <SelectionFeedback articleSlug={slug} />
      </div>
    </MDXProvider>
  );
}
