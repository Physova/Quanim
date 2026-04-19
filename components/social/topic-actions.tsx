"use client";

import { Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopicActions() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("URL copied to clipboard");
  };

  const handleInfo = () => {
    alert("Topic simulation developed for Quanim visualization engine. Content is strictly for educational purposes.");
  };

  return (
    <div className="flex items-center gap-3">
       <Button 
         variant="outline" 
         size="icon" 
         onClick={handleShare}
         className="rounded-none bg-white/5 border-white/10 hover:border-white/40 hover:text-white"
       >
          <Share2 className="h-4 w-4" />
       </Button>
       <Button 
         variant="outline" 
         size="icon" 
         onClick={handleInfo}
         className="rounded-none bg-white/5 border-white/10 hover:border-white/40 hover:text-white"
       >
          <Info className="h-4 w-4" />
       </Button>
    </div>
  );
}
