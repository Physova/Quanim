"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
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
import { MobileNav } from "@/components/mobile-nav"
import { LogOut, User as UserIcon } from "lucide-react"

export function Navbar({ visible = true }: { visible?: boolean }) {
  const { data: session, status } = useSession()

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 lg:px-12 h-[72px] backdrop-blur-xl bg-black/60 border-b border-white/5 transition-transform duration-500 ease-out",
      visible ? "translate-y-0" : "-translate-y-full"
    )}>
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-base font-bold tracking-[0.2em] uppercase text-foreground group-hover:opacity-80 transition-opacity">
          Physova
        </span>
      </Link>

      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex justify-center">
        <NavigationMenu className="flex">
          <NavigationMenuList className="gap-8">
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]")}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/topics" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]")}>
                  Topics
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/community" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]")}>
                  Community
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {status === "authenticated" ? (
          <>
            <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-border group cursor-pointer">
              <div className="size-8 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-foreground text-xs font-bold overflow-hidden transition-all">
                {session.user?.image ? (
                  <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} className="size-full object-cover" />
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
              className="hidden lg:flex text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all text-[10px] uppercase tracking-widest font-bold"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="hidden sm:flex text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-[0.2em] px-2 md:px-4">
              Sign In
            </Link>
            <Button asChild size="sm" className="rounded-none px-3 md:px-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
              <Link href="/auth/signup" className="flex items-center gap-2">
                Join Us
              </Link>
            </Button>
          </>
        )}
        <MobileNav />
      </div>
    </header>
  )
}
