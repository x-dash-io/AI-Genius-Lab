"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const authError = searchParams.get("error");

  // Check for OAuth errors in URL
  useEffect(() => {
    if (authError) {
      if (authError === "OAuthAccountNotLinked") {
        setError("This email is already registered. Please sign in with your email and password.");
      } else if (authError === "OAuthCallback") {
        setError("Authentication failed. Please try again.");
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    }
  }, [authError]);

  // Show form after short delay if still loading (prevents infinite loading)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "loading") {
        setShowForm(true);
      }
    }, 1000); // Show form after 1 second if still loading

    return () => clearTimeout(timer);
  }, [status]);

  // Redirect authenticated users away from sign-in page
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsRedirecting(true);
      
      // Clear any stale data
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      
      const redirectUrl = session.user.role === "admin" ? "/admin" : callbackUrl;
      
      // Use replace to prevent back button issues
      router.replace(redirectUrl);
    }
  }, [status, session, router, callbackUrl]);

  // Show loading only briefly, then show form
  if (status === "loading" && !showForm) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (isRedirecting || status === "authenticated") {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader size="lg" text="Redirecting..." />
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const signInPromise = signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Sign in timeout")), 10000)
      );

      const result = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        setIsLoading(false);
        setIsRedirecting(true);
        
        // Clear any stale session data
        if (typeof window !== "undefined") {
          sessionStorage.clear();
        }
        
        // Force session refresh and let useEffect handle redirect
        router.refresh();
        // The useEffect hook will handle the redirect when session updates
      } else {
        setError("Sign in failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err?.message === "Sign in timeout") {
        setError("Sign in is taking too long. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);
    
    console.log("Starting Google sign-in...");
    
    try {
      // Call signIn without await to allow redirect
      signIn("google", { 
        callbackUrl,
      });
      
      // Don't set loading to false - the page will redirect
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Access your purchased courses and continue learning.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {isRedirecting ? (
                <motion.div
                  key="redirecting"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="py-8"
                >
                  <Loader size="lg" text="Signing you in..." />
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Redirecting to dashboard...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <FloatingInput
                      id="email"
                      name="email"
                      type="email"
                      required
                      label="Email"
                      placeholder="you@example.com"
                      disabled={isLoading || isGoogleLoading || isRedirecting}
                    />
                    <div>
                      <FloatingInput
                        id="password"
                        name="password"
                        type="password"
                        required
                        label="Password"
                        placeholder="••••••••"
                        disabled={isLoading || isGoogleLoading || isRedirecting}
                      />
                      <div className="mt-2 text-right">
                        <Link
                          href="/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isRedirecting}>
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader size="sm" inline />
                          Signing in...
                        </span>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading || isRedirecting}
                  >
                    {isGoogleLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader size="sm" inline />
                        Connecting to Google...
                      </span>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Sign in with Google
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      href="/sign-up"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
