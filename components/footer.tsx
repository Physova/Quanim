import Link from "next/link";


export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 px-4 relative z-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="group flex flex-col gap-1">
              <span className="text-base font-bold tracking-[0.2em] uppercase text-white group-hover:opacity-80 transition-opacity">
                Physova
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
                <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/topics" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Topics</Link>
              </li>
              <li>
                <Link href="/community" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Community</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-6">Connect</h4>
            <div className="flex gap-4">
              <Link href="https://discord.com" className="p-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white/60 hover:text-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
              </Link>
              <Link href="https://twitter.com" className="p-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white/60 hover:text-white flex items-center justify-center fill-current">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z"></path></svg>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Physova Project. All Rights Reserved.
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
