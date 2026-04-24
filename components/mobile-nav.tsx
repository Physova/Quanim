"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NAV_LINKS } from "@/config/navigation"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

export function MobileNav() {
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
          <div className="mt-auto p-6 border-t border-white/5">
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
