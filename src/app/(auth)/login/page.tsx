'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import ImageCarousel from "@/components/ImageCarousel";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const carouselImages = [
  '/images/img_one.jpg',
  '/images/img_two.jpg',
  '/images/img_three.jpg',
];

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden bg-animated">
      {/* Image Carousel Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 relative shadow-lg items-center justify-center p-6 tilt-animate">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-0" />
        <div className="relative z-10 w-full max-w-lg aspect-[8/5] border rounded-lg border-glow">
          <ImageCarousel images={carouselImages} alt="Healthcare professionals" />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-3/5 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="w-full max-w-md">
        <div className="text-center mb-3 sm:mb-4 lg:mb-6">
          <Link href="/">
            <Image
              src="/ScrubSocietyAI.png"
              alt="Logo"
              width={24}
              height={24}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary text-primary-foreground rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 cursor-pointer object-contain"
            />
          </Link>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1" data-testid="text-page-title">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-foreground/70 hidden sm:block">Sign in to your ScrubSocietyAI account</p>
        </div>

        <Card className="p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-none lg:rounded-r-2xl border shadow-lg bg-background border-glow">
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm sm:text-base">Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm sm:text-base">Password <span className="text-destructive">*</span></Label>
                <button type="button" className="text-xs sm:text-sm text-foreground/80 hover:text-foreground hover:underline" data-testid="link-forgot-password">
                  Forgot?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 sm:h-11 text-sm sm:text-base mt-3" 
              data-testid="button-submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs sm:text-sm text-foreground/70">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-primary hover:underline cursor-pointer" data-testid="link-register">
                  Register now
                </span>
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

