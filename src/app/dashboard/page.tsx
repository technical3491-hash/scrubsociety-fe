'use client';

import Navbar from "@/components/layout/Navbar";
import DashboardWidget from "@/components/DashboardWidget";
import { Activity, Sparkles, GraduationCap, AlertTriangle, Users, Plus, Loader2, Heart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserTotalLikes } from "@/hooks/use-cases";

export default function Dashboard() {
  const { user, isLoadingUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: totalLikes = 0, isLoading: isLoadingLikes } = useUserTotalLikes(user?.id);

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingUser, isAuthenticated, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Welcome back, {getUserDisplayName()}</h1>
          <p className="text-muted-foreground">Here's what's happening in your network today</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/case-feed">
            <Button size="lg" data-testid="button-post-case">
              <Plus className="w-4 h-4 mr-2" />
              Post Case
            </Button>
          </Link>
          <Link href="/drug-search">
            <Button size="lg" variant="outline" data-testid="button-search-drug">
              Search Drug
            </Button>
          </Link>
          <Link href="/drug-intelligence">
            <Button size="lg" variant="outline" data-testid="button-analyze-prescription">
              <FileText className="w-4 h-4 mr-2" />
              Drug Intelligence
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline" data-testid="button-message-peer">
              Message Peer
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardWidget
            title="Today's Cases"
            icon={Activity}
            metric="12"
            description="New cases posted in your network"
            actionLabel="View All Cases"
            onAction={() => console.log("View cases")}
          />
          
          <DashboardWidget
            title="AI Assist"
            icon={Sparkles}
            metric="3"
            description="AI suggestions for your recent cases"
            actionLabel="View Insights"
            onAction={() => console.log("View insights")}
          />

          <DashboardWidget
            title="CME Credits"
            icon={GraduationCap}
            metric="24"
            description="Credits earned this year"
            actionLabel="Browse Courses"
            onAction={() => console.log("Browse courses")}
          />

          <DashboardWidget
            title="Drug Alerts"
            icon={AlertTriangle}
            metric="5"
            description="New safety alerts and recalls"
            actionLabel="View Alerts"
            onAction={() => console.log("View alerts")}
          />

          <DashboardWidget
            title="Peers Online"
            icon={Users}
            metric="234"
            description="Doctors currently active"
            actionLabel="Find Peers"
            onAction={() => console.log("Find peers")}
          />

          <DashboardWidget
            title="Your Cases"
            icon={Activity}
            metric="47"
            description="Total cases you've posted"
            actionLabel="Manage Cases"
            onAction={() => console.log("Manage cases")}
          />

          <DashboardWidget
            title="Total Likes"
            icon={Heart}
            metric={isLoadingLikes ? "..." : totalLikes.toString()}
            description="Total likes on all your cases"
            actionLabel="View Cases"
            onAction={() => router.push('/case-feed')}
          />
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-2">New Feature: AI-Powered Diagnosis Support</h2>
          <p className="text-muted-foreground mb-4">
            Get intelligent suggestions based on patient symptoms, lab results, and imaging data. Try it on your next case discussion.
          </p>
          <Button variant="default" data-testid="button-learn-more">
            Learn More
          </Button>
        </div>
      </main>
    </div>
  );
}

