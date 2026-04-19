import Link from "next/link";
import { Github, Twitter, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 px-4 relative z-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="group flex flex-col gap-1">
              <span className="text-base font-bold tracking-[0.2em] uppercase text-white group-hover:opacity-80 transition-opacity">
                Quanim
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
                Visualizing Physics
              </span>
            </Link>
            <p className="mt-6 text-white/30 text-sm max-w-xs leading-relaxed">
              Interpreting the Universe through interactive visual physics. 
              An exploration of complex phenomena made accessible.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Navigation</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm text-white/30 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/topics" className="text-sm text-white/30 hover:text-white transition-colors">Topics</Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-white/30 hover:text-white transition-colors">Community</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Connect</h4>
            <div className="flex gap-4">
              <Link href="https://discord.com" className="p-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white/60 hover:text-white flex items-center justify-center">
                <img src="/discord-icon.png" alt="Discord" className="w-4 h-4 invert opacity-60 hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="https://github.com" className="p-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white/60 hover:text-white flex items-center justify-center">
                <Github className="w-4 h-4" />
              </Link>
              <Link href="https://twitter.com" className="p-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white/60 hover:text-white flex items-center justify-center fill-current">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"></path></svg>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Quanim Project. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-[10px] font-mono text-white/20 uppercase tracking-widest hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] font-mono text-white/20 uppercase tracking-widest hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
