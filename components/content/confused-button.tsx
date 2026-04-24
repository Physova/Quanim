"use client";

import { useState } from "react";

interface ConfusedButtonProps {
  articleSlug: string;
  paragraphId: string;
}

export function ConfusedButton({
  articleSlug,
  paragraphId,
}: ConfusedButtonProps) {
  const [clicked, setClicked] = useState(false);

  async function handleClick() {
    if (clicked) return;
    setClicked(true);
    try {
      await fetch("/api/reactions/confused", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleSlug, paragraphId }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <button
      onClick={handleClick}
      title="Request clarification on this section"
      className={`
        opacity-0 group-hover:opacity-100 focus:opacity-100
        inline-flex items-center gap-1 ml-3 px-2 py-0.5
        text-[9px] font-bold uppercase tracking-widest transition-all duration-300
        border rounded-none
        ${clicked
          ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/20"
          : "text-white/20 border-white/5 hover:text-white hover:bg-white/5 hover:border-white/20"
        }
      `}
    >
      {clicked ? "Signal Sent" : "Confused?"}
    </button>
  );
}
