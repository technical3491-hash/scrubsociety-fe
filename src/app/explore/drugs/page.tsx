import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Lock } from "lucide-react";

export default function PublicDrugSearch() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />
      <main className="pt-20 px-4 pb-12 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Drug Search</h1>
          <p className="text-muted-foreground">
            Access comprehensive drug information, safety data, and interaction alerts
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for drugs, generics, or combinations..."
                className="pl-10 h-12"
                disabled
                data-testid="input-search"
              />
            </div>
            <Button size="lg" disabled data-testid="button-search">
              Search
            </Button>
          </div>
        </div>

        <Card className="p-8 sm:p-12 rounded-2xl text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Drug Database Access for Verified Doctors
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Our comprehensive drug database includes safety information, interaction alerts, contraindications, and prescribing guidelines for thousands of medications. This feature is available exclusively to verified healthcare professionals.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
              <div className="bg-card p-4 rounded-2xl border">
                <h3 className="font-semibold mb-2">Safety Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time drug safety alerts and recalls
                </p>
              </div>
              <div className="bg-card p-4 rounded-2xl border">
                <h3 className="font-semibold mb-2">Interactions</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive drug-drug interactions
                </p>
              </div>
              <div className="bg-card p-4 rounded-2xl border">
                <h3 className="font-semibold mb-2">Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  Evidence-based prescribing guidelines
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" data-testid="button-join-free">
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
        </Card>

        <div className="mt-12 p-6 bg-muted/30 rounded-2xl">
          <h3 className="font-semibold mb-2">Why Verification Matters</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ScrubSocietyAI verifies all healthcare professionals to ensure the integrity of clinical information and protect patient safety. Our drug database contains sensitive medical information that requires professional interpretation and should only be accessed by licensed healthcare providers.
          </p>
        </div>
      </main>
    </div>
  );
}

