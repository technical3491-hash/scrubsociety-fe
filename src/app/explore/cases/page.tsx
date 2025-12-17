'use client';

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CaseCard from "@/components/CaseCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { useCases } from "@/hooks/use-cases";
import { Case } from "@/lib/api/cases";
import CaseDetailsDialog from "@/components/CaseDetailsDialog";

export default function PublicCaseFeed() {  
    // Fetch cases from API
    const { data, isLoading, error, isError } = useCases({});
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [displayCount, setDisplayCount] = useState(3);
  
    const allCases: Case[] = data?.cases ?? [];
    const displayedCases = allCases.slice(0, displayCount);
    const hasMore = displayCount < allCases.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />
      <main className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Case Discussions</h1>
          <p className="text-muted-foreground">Preview of recent case discussions from verified doctors</p>
        </div>

        <Card className="p-6 rounded-2xl mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Join ScrubSocietyAI to Access Full Content</h3>
              <p className="text-muted-foreground mb-4">
                Create a free account to view full case details, participate in discussions, post your own cases, and connect with verified healthcare professionals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register">
                  <Button size="lg" data-testid="button-join-now">
                    Join Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" data-testid="button-login">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading cases...</span>
          </div>
        )}

        {!isLoading && displayedCases.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {displayedCases.map((caseItem) => (
                <div key={caseItem.id} className="relative">
                  <CaseCard 
                    {...caseItem}
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setDialogOpen(true);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent rounded-2xl pointer-events-none" />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDisplayCount(displayCount + 3)}
                  data-testid="button-load-more"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
        
        <CaseDetailsDialog
          caseData={selectedCase}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        <div className="text-center mt-8">
          <Card className="p-8 rounded-2xl">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Sign Up to See More</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Access thousands of case discussions, connect with specialists, and contribute to the medical community.
            </p>
            <Link href="/register">
              <Button size="lg" data-testid="button-signup-bottom">
                Create Free Account
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}

