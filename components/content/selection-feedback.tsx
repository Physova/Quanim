"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Toast } from "@/components/ui/toast";

interface SelectionFeedbackProps {
  articleSlug: string;
}

export function SelectionFeedback({ articleSlug }: SelectionFeedbackProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedParaId, setSelectedParaId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        // Delay clearing to allow click on the button
        setTimeout(() => {
          if (window.getSelection()?.isCollapsed) {
            setPosition(null);
            setSelectedParaId(null);
          }
        }, 100);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Find paragraph ID by looking up from selection container
      let node: Node | null = range.commonAncestorContainer;
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentNode;
      }

      const element = node as HTMLElement | null;
      const para = element?.closest("[data-para-id]");
      const paraId = para?.getAttribute("data-para-id");

      if (paraId) {
        setSelectedParaId(paraId);
        setPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        });
      } else {
        // Still allow showing if inside any MDX content that might not have IDs yet
        // but try to find the closest paragraph
        const closestPara = element?.closest("p");
        if (closestPara) {
           const fallbackId = closestPara.getAttribute("data-para-id");
           if (fallbackId) {
              setSelectedParaId(fallbackId);
              setPosition({
                top: rect.top - 50,
                left: rect.left + rect.width / 2,
              });
           }
        }
      }
    };

    document.addEventListener("mouseup", handleSelection);
    window.addEventListener("scroll", () => setPosition(null), { passive: true });
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      window.removeEventListener("scroll", () => setPosition(null));
    };
  }, []);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedParaId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reactions/confused", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug,
          paragraphId: selectedParaId,
        }),
      });

      if (response.ok) {
        setShowToast(true);
        setPosition(null);
        setSelectedParaId(null);
        window.getSelection()?.removeAllRanges();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {position && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing selection on click
            onClick={handleSubmit}
            className="z-[60] flex items-center gap-2 bg-black text-white px-4 py-2 rounded-none shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 active:scale-95 whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Confusing?</span>
          </motion.button>
        )}
      </AnimatePresence>

      <Toast 
        message="Feedback received! We'll look into this section." 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </>
  );
}
