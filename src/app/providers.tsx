'use client';

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  
  // Force light theme on mount and remove dark class
  useEffect(() => {
    // Remove dark class from document element
    document.documentElement.classList.remove('dark');
    // Remove theme from localStorage to prevent override
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme');
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} storageKey="theme">
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

