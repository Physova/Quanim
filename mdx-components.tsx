import type { MDXComponents } from 'mdx/types'
import { Lab } from '@/components/simulations/lab-interface'
import React from 'react'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4 text-slate-100" {...props} />,
    h2: (props) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-amber-500" {...props} />,
    h3: (props) => <h3 className="text-xl font-medium mt-6 mb-3 text-slate-200" {...props} />,
    p: (props) => <p className="leading-relaxed mb-4 text-slate-400" {...props} />,
    strong: (props) => <strong className="font-semibold text-slate-200" {...props} />,
    em: (props) => <em className="italic text-slate-300" {...props} />,
    ul: (props) => <ul className="list-disc list-inside mb-4 space-y-2 text-slate-400" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-400" {...props} />,
    li: (props) => <li className="ml-4" {...props} />,
    blockquote: (props) => (
      <blockquote className="border-l-4 border-amber-500 pl-4 py-2 my-6 italic bg-slate-900/30 rounded-r text-slate-300" {...props} />
    ),
    code: (props) => <code className="bg-slate-800 rounded px-1.5 py-0.5 text-amber-400 font-mono text-sm" {...props} />,
    pre: (props) => <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 overflow-x-auto" {...props} />,
    hr: () => <hr className="my-10 border-slate-800" />,
    Lab: (props: React.ComponentProps<typeof Lab>) => <Lab {...props} />,
    ...components,
  }
}
