"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join the Quanim community today
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Isaac Newton"
              type="text"
              className="border-white/10 bg-white/5"
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              placeholder="isaac@quanim.edu"
              type="email"
              className="border-white/10 bg-white/5"
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              className="border-white/10 bg-white/5"
              disabled
            />
          </div>
          <Button className="w-full bg-white text-black hover:bg-white/90" disabled>
            Create Account
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-muted-foreground backdrop-blur-xl">
                Note
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200/80">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Direct sign-up is currently disabled.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/10 bg-white/5 pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-white underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
