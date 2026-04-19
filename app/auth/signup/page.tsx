"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background handled by body dot-grid */}

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl relative z-10 rounded-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif font-bold tracking-tighter uppercase">Join the Void</CardTitle>
          <CardDescription className="text-white/40 font-sans">
            Join the Quanim community today
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-[0.1em] text-white/60 font-medium" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Isaac Newton"
              type="text"
              className="border-white/10 bg-white/5 rounded-none font-sans"
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-[0.1em] text-white/60 font-medium" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              placeholder="isaac@quanim.edu"
              type="email"
              className="border-white/10 bg-white/5 rounded-none font-sans"
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-xs uppercase tracking-[0.1em] text-white/60 font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              className="border-white/10 bg-white/5 rounded-none font-sans"
              disabled
            />
          </div>
          <Button className="w-full bg-white text-black hover:bg-white/90 font-bold rounded-none text-[10px] uppercase tracking-[0.2em]" disabled>
            Create Account
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-white/30 font-mono tracking-[0.15em]">
                Note
              </span>
            </div>
          </div>
          <div className="rounded-none border border-white/10 bg-white/[0.02] p-3 text-sm text-white/50 font-sans">
            <p className="flex items-center gap-2">
              <span className="h-1 w-1 bg-white/40" />
              Direct sign-up is currently disabled.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 bg-white/[0.02] pt-6">
          <div className="text-center text-sm text-white/40 font-sans">
            Already have an account? 
            <Link href="/auth/signin" className="text-white underline-offset-4 hover:underline ml-1">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
