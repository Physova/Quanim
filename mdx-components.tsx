import type { MDXComponents } from 'mdx/types'
import { Lab } from '@/components/simulations/lab-interface'
import { MotionLab } from '@/components/simulations/motion-lab'
import { ForceAndLawsOfMotionLab } from '@/components/simulations/force-and-laws-of-motion-lab'
import { EquationBlock } from '@/components/content/equation-block'
import { Quiz } from '@/components/content/quiz'
import React from 'react'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4 text-slate-100" {...props} />,
    h2: (props) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-white uppercase tracking-tighter" {...props} />,
    h3: (props) => <h3 className="text-xl font-medium mt-6 mb-3 text-slate-200" {...props} />,
    p: (props) => {
      const { children, ...rest } = props;
      return (
        <p className="leading-relaxed mb-6 text-white/60 mdx-para" {...rest}>
          {children}
        </p>
      );
    },
    strong: (props) => <strong className="font-semibold text-slate-200" {...props} />,
    em: (props) => <em className="italic text-slate-300" {...props} />,
    ul: (props) => <ul className="list-disc list-inside mb-4 space-y-2 text-slate-400" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-400" {...props} />,
    li: (props) => <li className="ml-4" {...props} />,
    blockquote: (props) => (
      <blockquote className="border-l-2 border-white/20 pl-6 py-4 my-8 italic bg-white/[0.02] rounded-none text-white/50 font-mono text-sm" {...props} />
    ),
    code: (props) => <code className="bg-white/5 rounded-none px-1.5 py-0.5 text-white/80 font-mono text-sm border border-white/5" {...props} />,
    pre: (props) => <pre className="bg-black border border-white/5 rounded-none p-6 mb-8 overflow-x-auto font-mono text-xs text-white/40" {...props} />,
    hr: () => <hr className="my-12 border-white/5" />,
    Lab: (props: React.ComponentProps<typeof Lab>) => <Lab {...props} />,
    MotionLab: (props: React.ComponentProps<typeof MotionLab>) => <MotionLab {...props} />,
    ForceAndLawsOfMotionLab: (props: React.ComponentProps<typeof ForceAndLawsOfMotionLab>) => <ForceAndLawsOfMotionLab {...props} />,
    EquationBlock: (props: React.ComponentProps<typeof EquationBlock>) => <EquationBlock {...props} />,
    Quiz: (props: React.ComponentProps<typeof Quiz>) => <Quiz {...props} />,
    ...components,
  }
}
