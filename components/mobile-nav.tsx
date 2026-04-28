"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { NAV_LINKS } from "@/config/navigation"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

export function MobileNav() {
  const { data: session } = useSession();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] bg-black border-l border-white/10 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <span className="text-base font-bold tracking-[0.2em] uppercase text-foreground">
              Physova
            </span>
          </div>
          <nav className="flex flex-col p-6 gap-6">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-6 border-t border-white/5 space-y-3">
            {session ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                    {(session.user?.name || session.user?.email)?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{session.user?.name || session.user?.email?.split("@")[0]}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">Operator</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="w-full justify-start text-muted-foreground hover:text-destructive text-[10px] uppercase tracking-widest font-bold"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-center text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-[0.2em] py-2"
                >
                  Sign In
                </Link>
                <Button asChild size="sm" className="w-full rounded-none text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Link href="/auth/signup">Join Us</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

