"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Success — redirect to signin
      router.push("/auth/signin?registered=true");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl relative z-10 rounded-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif font-bold tracking-tighter uppercase">Join Physova</CardTitle>
          <CardDescription className="text-white/40 font-sans">
            Create your account to track progress and join discussions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-[0.1em] text-white/60 font-medium" htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                placeholder="quantum_explorer"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-white/10 bg-white/5 rounded-none font-sans"
                required
                minLength={3}
                maxLength={20}
              />
              <p className="text-[10px] text-white/30 font-mono">Letters, numbers, underscores, hyphens. 3-20 chars.</p>
            </div>
            <div className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-[0.1em] text-white/60 font-medium" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 rounded-none font-sans"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-sans text-xs uppercase tracking-[0.1em] text-white/60 font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/5 rounded-none font-sans pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-white/30 font-mono">Minimum 6 characters.</p>
            </div>

            {error && (
              <div className="rounded-none border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 font-sans">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 font-bold rounded-none text-[10px] uppercase tracking-[0.2em]"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 bg-white/[0.02] pt-6">
          <div className="text-center text-sm text-white/40 font-sans">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-white underline-offset-4 hover:underline ml-1">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
