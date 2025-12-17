'use client';

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import DrugResultCard from "@/components/DrugResultCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function DrugSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setShowResults(true);
  };

  const mockResults = [
    {
      drugName: "Aspirin",
      genericName: "Acetylsalicylic Acid",
      safetyStatus: "safe" as const,
      indication: "Pain relief, fever reduction, anti-inflammatory, antiplatelet therapy",
      warnings: [
        "May cause stomach irritation and bleeding",
        "Avoid in children with viral infections (Reye's syndrome risk)",
        "Use with caution in patients with bleeding disorders",
      ],
    },
    {
      drugName: "Warfarin",
      genericName: "Coumadin",
      safetyStatus: "caution" as const,
      indication: "Anticoagulant for preventing blood clots, stroke prevention in atrial fibrillation",
      warnings: [
        "Regular INR monitoring required (target 2-3 for most indications)",
        "Numerous drug-drug and drug-food interactions",
        "Contraindicated in pregnancy (teratogenic)",
        "Increased bleeding risk - avoid with NSAIDs",
      ],
    },
    {
      drugName: "Metformin + Gliclazide",
      genericName: "Combination therapy",
      safetyStatus: "contraindicated" as const,
      indication: "Type 2 diabetes management (combination not recommended)",
      warnings: [
        "Contraindicated in severe renal impairment (eGFR <30)",
        "Risk of lactic acidosis in renal failure",
        "Withhold 48 hours before and after surgery or contrast procedures",
        "Increased risk of hypoglycemia with gliclazide combination",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 px-4 pb-12 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Drug Search</h1>
          <p className="text-muted-foreground">
            Search comprehensive drug information, safety data, and interaction alerts
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for drugs, generics, or combinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
                data-testid="input-search"
              />
            </div>
            <Button type="submit" size="lg" data-testid="button-search">
              Search
            </Button>
          </div>
        </form>

        {showResults && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Search Results for "{searchQuery || "common drugs"}"
              </h2>
              <p className="text-sm text-muted-foreground">
                Found {mockResults.length} results
              </p>
            </div>

            <div className="space-y-4">
              {mockResults.map((result, index) => (
                <DrugResultCard key={index} {...result} />
              ))}
            </div>

            <div className="mt-8 p-6 bg-muted/30 rounded-2xl">
              <h3 className="font-semibold mb-2">Important Notice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This drug information is for educational purposes only and should not replace clinical judgment.
                Always verify with current prescribing information and consider individual patient factors.
                Report adverse events to the appropriate pharmacovigilance authority.
              </p>
            </div>
          </div>
        )}

        {!showResults && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a drug name, generic name, or combination to access comprehensive safety information,
              interactions, and prescribing guidelines.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

