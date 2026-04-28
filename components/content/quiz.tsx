"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface QuizProps {
  question: string;
  options: string[];
  correctIndex: number;
}

export function Quiz({ question, options, correctIndex }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
  };

  return (
    <div className="my-8 p-6 bg-white/[0.02] border border-white/10 rounded-none relative overflow-hidden group">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header label */}
        <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-4">
          Self Assessment
        </div>

        {/* Question */}
        <p className="text-sm text-white/80 mb-6 font-medium leading-relaxed">
          {question}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {options.map((option, i) => {
            const isCorrect = i === correctIndex;
            const isSelected = i === selected;
            let borderClass = "border-white/10";
            let bgClass = "bg-transparent";
            let textClass = "text-white/60";

            if (revealed && isSelected && isCorrect) {
              borderClass = "border-white/40";
              bgClass = "bg-white/10";
              textClass = "text-white";
            } else if (revealed && isSelected && !isCorrect) {
              borderClass = "border-white/20";
              bgClass = "bg-white/[0.03]";
              textClass = "text-white/30";
            } else if (revealed && isCorrect) {
              borderClass = "border-white/30";
              textClass = "text-white/80";
            } else if (revealed) {
              textClass = "text-white/20";
            }

            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                whileTap={!revealed ? { scale: 0.98 } : {}}
                className={`w-full text-left px-4 py-3 border ${borderClass} ${bgClass} rounded-none transition-all duration-300 flex items-center gap-3 ${
                  !revealed
                    ? "cursor-pointer hover:border-white/20 hover:bg-white/[0.02]"
                    : "cursor-default"
                }`}
              >
                {/* Letter indicator */}
                <span className="text-[10px] font-mono font-bold text-white/20 w-4 flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>

                {/* Option text */}
                <span className={`text-sm ${textClass} flex-1 transition-colors duration-300`}>
                  {option}
                </span>

                {/* Result icon */}
                {revealed && isSelected && (
                  isCorrect
                    ? <Check className="h-4 w-4 text-white/80 flex-shrink-0" />
                    : <X className="h-4 w-4 text-white/30 flex-shrink-0" />
                )}
                {revealed && !isSelected && isCorrect && (
                  <Check className="h-4 w-4 text-white/40 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Result message */}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-[10px] font-mono uppercase tracking-[0.15em]"
          >
            {selected === correctIndex ? (
              <span className="text-white/60">Correct — well done.</span>
            ) : (
              <span className="text-white/30">
                Incorrect — the answer is {String.fromCharCode(65 + correctIndex)}.
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/40 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-white/40 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-white/40 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-white/40 transition-colors" />
    </div>
  );
}
