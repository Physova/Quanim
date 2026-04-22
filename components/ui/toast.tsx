"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl border border-emerald-500/50"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium whitespace-nowrap">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
