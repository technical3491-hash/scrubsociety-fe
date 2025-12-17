'use client';

import Navbar from "@/components/layout/Navbar";
import CMECard from "@/components/CMECard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function CME() {
  const [category, setCategory] = useState("all");

  const courses = [
    {
      title: "Advanced Cardiac Life Support (ACLS)",
      description: "Comprehensive training on emergency cardiovascular care protocols and procedures for healthcare professionals.",
      duration: "4 hours",
      credits: 4,
      category: "Cardiology",
    },
    {
      title: "Diabetes Management Update 2025",
      description: "Latest guidelines and treatment approaches for Type 2 diabetes, including new medications and lifestyle interventions.",
      duration: "3 hours",
      credits: 3,
      category: "Endocrinology",
    },
    {
      title: "Neurology Board Review",
      description: "Intensive review course covering essential topics for neurology board certification and clinical practice updates.",
      duration: "8 hours",
      credits: 8,
      category: "Neurology",
    },
    {
      title: "Antimicrobial Stewardship Principles",
      description: "Evidence-based strategies for appropriate antibiotic use, resistance prevention, and hospital infection control.",
      duration: "2 hours",
      credits: 2,
      category: "Infectious Disease",
    },
    {
      title: "Pediatric Emergency Medicine Essentials",
      description: "Critical pediatric emergencies, assessment techniques, and age-appropriate treatment protocols for emergency settings.",
      duration: "5 hours",
      credits: 5,
      category: "Pediatrics",
    },
    {
      title: "Oncology: Latest Treatment Advances",
      description: "Recent breakthroughs in cancer immunotherapy, targeted therapies, and personalized medicine approaches.",
      duration: "6 hours",
      credits: 6,
      category: "Oncology",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">CME & Research</h1>
          <p className="text-muted-foreground">
            Earn credits and stay updated with the latest medical education and research
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-56" data-testid="select-category">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
              <SelectItem value="endocrinology">Endocrinology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CMECard key={index} {...course} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            Load More Courses
          </Button>
        </div>

        <div className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-3">Submit Your Research</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Share your clinical research, case studies, and medical insights with the ScrubSocietyAI community.
              Peer-reviewed submissions earn additional CME credits and professional recognition.
            </p>
            <Button size="lg" data-testid="button-submit-research">
              Submit Research
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

