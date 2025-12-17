'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Heart, MessageCircle, MoreHorizontal, Loader2, Pill, FileText, BookOpen, Sparkles, Bot } from 'lucide-react';
import { useDrugs, useDrugClasses, useSearchDrugs } from '@/hooks/use-drugs';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all-systems');
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  const { data: drugsData, isLoading, error } = useDrugs({
    search: searchQuery || undefined,
    page,
    limit: 10,
  });

  const { data: searchResults } = useSearchDrugs(searchQuery, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const getSafetyStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'caution':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'warning':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'contraindicated':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSafetyStatusLabel = (status: string) => {
    switch (status) {
      case 'safe':
        return 'Safe';
      case 'caution':
        return 'Use with Caution';
      case 'warning':
        return 'Warning';
      case 'contraindicated':
        return 'Contraindicated';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Greeting */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name ? user.name.split(' ')[0] : 'Doctor'}
                </h2>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="my-specialty">My Specialty</TabsTrigger>
                    <TabsTrigger value="all-systems">All Systems</TabsTrigger>
                    <TabsTrigger value="ai-summarized">AI Summarized</TabsTrigger>
                    <TabsTrigger value="institutional">Institutional</TabsTrigger>
                  </TabsList>

                  {/* Search Bar */}
                  <div className="mb-6">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search for drugs, generics, or combinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12"
                        data-testid="input-search"
                      />
                      {searchQuery && searchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((drug) => (
                            <div
                              key={drug._id}
                              className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                              onClick={() => {
                                setSearchQuery(drug.name);
                                setPage(1);
                              }}
                            >
                              <div className="font-medium">{drug.name}</div>
                              <div className="text-sm text-muted-foreground">{drug.genericName}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Feed Content */}
                  <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : error ? (
                      <div className="text-center py-16">
                        <p className="text-destructive mb-2">Error loading drugs</p>
                        <p className="text-sm text-muted-foreground">
                          {error instanceof Error ? error.message : 'Unknown error'}
                        </p>
                      </div>
                    ) : drugsData && drugsData.drugs.length > 0 ? (
                      <div className="space-y-4">
                        {drugsData.drugs.map((drug) => (
                          <Card key={drug._id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                              {/* Avatar/Icon */}
                              <Avatar className="w-12 h-12 shrink-0">
                                <AvatarFallback className="bg-primary/10">
                                  <Pill className="w-6 h-6 text-primary" />
                                </AvatarFallback>
                              </Avatar>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">{drug.name}</h3>
                                      <Badge className={`${getSafetyStatusColor(drug.safetyStatus)} border text-xs`}>
                                        {getSafetyStatusLabel(drug.safetyStatus)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{drug.genericName}</p>
                                    {drug.drugClass && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {drug.drugClass}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="icon" className="shrink-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Tags */}
                                {(drug.tags && drug.tags.length > 0) && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {drug.tags.map((tag, index) => (
                                      <span key={index} className="text-sm text-muted-foreground">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Indication/Description */}
                                <div className="mb-3">
                                  <p className="text-sm leading-relaxed">{drug.indication}</p>
                                  {drug.description && (
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                      {drug.description}
                                    </p>
                                  )}
                                </div>

                                {/* Warnings Preview */}
                                {drug.warnings && drug.warnings.length > 0 && (
                                  <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Warnings:</p>
                                    <ul className="space-y-1">
                                      {drug.warnings.slice(0, 2).map((warning, index) => (
                                        <li key={index} className="text-xs flex items-start gap-2">
                                          <span className="text-destructive mt-0.5">•</span>
                                          <span>{warning}</span>
                                        </li>
                                      ))}
                                      {drug.warnings.length > 2 && (
                                        <li className="text-xs text-muted-foreground">
                                          +{drug.warnings.length - 2} more warnings
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {/* Engagement Metrics */}
                                <div className="flex items-center justify-between pt-3 border-t">
                                  <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="sm" className="h-8">
                                      <Heart className="w-4 h-4 mr-2" />
                                      <span className="text-sm">0</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8">
                                      <MessageCircle className="w-4 h-4 mr-2" />
                                      <span className="text-sm">0</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-primary">
                                      Ask Dr Scrub about &gt;
                                    </Button>
                                  </div>
                                  {drug.createdAt && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(drug.createdAt), { addSuffix: true })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}

                        {/* Pagination */}
                        {drugsData.pagination.totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {drugsData.pagination.page} of {drugsData.pagination.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              onClick={() => setPage((p) => Math.min(drugsData.pagination.totalPages, p + 1))}
                              disabled={page === drugsData.pagination.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Pill className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No drugs found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {searchQuery ? 'Try adjusting your search query' : 'No drugs available in the database'}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Quick Tools Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Quick Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="text-xs">AI Note Writer</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Pill className="w-5 h-5" />
                    <span className="text-xs">Drug Interaction Checker</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs">Cross System Insight</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">CME Digest</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">Post Case</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs">Institution Spaces</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Today's AI Highlights */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Today's AI Highlights</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                    <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">New Drug Alert</p>
                      <Button variant="link" className="h-auto p-0 text-xs">
                        Add to My Notes
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                    <Pill className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">Drug Interaction Insight</p>
                      <Button variant="link" className="h-auto p-0 text-xs">
                        Add to My Notes
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                    <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">Top Drug in Cardiology</p>
                      <Button variant="link" className="h-auto p-0 text-xs">
                        Add to My Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats/Info Card */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Drug Database</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Drugs</span>
                    <span className="font-semibold">{drugsData?.pagination.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className="font-semibold">
                      {drugsData?.drugs.filter(d => d.availability === 'available').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prescription Required</span>
                    <span className="font-semibold">
                      {drugsData?.drugs.filter(d => d.prescriptionRequired).length || 0}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Important Notice */}
              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold mb-2 text-sm">Important Notice</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This drug information is for educational purposes only and should not replace clinical judgment.
                  Always verify with current prescribing information.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
