"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { LogOut, User as UserIcon } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-[72px] backdrop-blur-xl bg-background/60 border-b border-white/5 transition-all">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-2xl font-sans font-bold tracking-tighter text-foreground group-hover:opacity-80 transition-opacity">
          Quanim
        </span>
      </Link>

      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]")}>
                Nexus
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/topics" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]")}>
                Repository
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/community" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]")}>
                Network
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4">
        {status === "authenticated" ? (
          <>
            <div className="flex items-center gap-3 pr-4 border-r border-border group cursor-pointer">
              <div className="size-8 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-foreground text-xs font-bold overflow-hidden transition-all">
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="size-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start -space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Operator</span>
                <span className="text-xs font-bold text-foreground">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all text-[10px] uppercase tracking-widest font-bold"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-[0.2em] px-4">
              Access
            </Link>
            <Button asChild size="sm" className="rounded-none px-6 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Link href="/auth/signup" className="flex items-center gap-2">
                JOIN_VOID
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
