'use client';

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import CaseCard from "@/components/CaseCard";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Loader2, AlertCircle, Sparkles, Send, Trash2, Bot, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { queryAI, ChatMessage } from "@/lib/api/ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCases, useCreateCase, useUpdateCase, useDeleteCase } from "@/hooks/use-cases";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Case, CaseFormData } from "@/lib/api/cases";
import CaseDetailsDialog from "@/components/CaseDetailsDialog";
import CaseFormDialog from "@/components/CaseFormDialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CaseFeed() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCommentsOnOpen, setShowCommentsOnOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deleteCaseId, setDeleteCaseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiChatStarted, setIsAiChatStarted] = useState(false);
  const [aiChatContainerRef, setAiChatContainerRef] = useState<HTMLDivElement | null>(null);
  const { isAuthenticated: authIsAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // Use state to prevent hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    setIsAuthenticated(authIsAuthenticated);
  }, [authIsAuthenticated]);

  // Scroll to bottom when new AI messages are added
  useEffect(() => {
    if (aiChatContainerRef) {
      aiChatContainerRef.scrollTop = aiChatContainerRef.scrollHeight;
    }
  }, [aiMessages, aiChatContainerRef]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: aiQuery.trim(),
    };

    const updatedMessages = [...aiMessages, userMessage];
    setAiMessages(updatedMessages);
    setIsAiChatStarted(true);
    const currentQuery = aiQuery.trim();
    setAiQuery("");
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      const response = await queryAI({ 
        query: currentQuery,
        context: 'case-feed-chat',
        messages: updatedMessages,
      });
      
      if (response.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.response || response.suggestions.join('\n\n'),
        };
        setAiMessages(prev => [...prev, aiMessage]);
      } else {
        setAiError('No response available. Please try rephrasing your query.');
        setAiMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('AI search error:', error);
      setAiError(
        error instanceof Error 
          ? error.message 
          : 'Failed to get AI response. Please try again.'
      );
      setAiMessages(prev => prev.slice(0, -1));
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearAiChat = () => {
    setAiMessages([]);
    setAiError(null);
    setIsAiChatStarted(false);
  };

  // Fetch cases from API
  const { data, isLoading, error, isError } = useCases({
    filter,
    page,
    limit,
  });

  // Mutations
  const createCaseMutation = useCreateCase();
  const updateCaseMutation = useUpdateCase();
  const deleteCaseMutation = useDeleteCase();

  const cases: Case[] = (data?.cases ?? []) as Case[];
  const hasMore: boolean = data?.hasMore ?? false;

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const handleNewCase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a case.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    setEditingCase(null);
    setFormDialogOpen(true);
  };

  const handleEditCase = (id: string) => {
    const caseToEdit = cases.find((c) => c.id === id);
    if (caseToEdit) {
      setEditingCase(caseToEdit);
      setFormDialogOpen(true);
    }
  };

  const handleDeleteCase = (id: string) => {
    setDeleteCaseId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteCaseId) {
      try {
        await deleteCaseMutation.mutateAsync(deleteCaseId);
        setDeleteDialogOpen(false);
        setDeleteCaseId(null);
      } catch (error) {
        console.error("Failed to delete case:", error);
      }
    }
  };

  const handleFormSubmit = async (data: CaseFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to create or edit a case.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      if (editingCase) {
        await updateCaseMutation.mutateAsync({ id: editingCase.id, data });
        toast({
          title: "Success",
          description: "Case updated successfully.",
        });
      } else {
        await createCaseMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Case created successfully.",
        });
      }
      setFormDialogOpen(false);
      setEditingCase(null);
    } catch (error: unknown) {
      console.error("Failed to save case:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save case. Please try again.";
      
      // Check if it's an authentication error
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("not authenticated") || error?.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please login to create or edit a case.",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={isAuthenticated} />
      <main className="pt-20 px-4 pb-12 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Case Feed</h1>
            <p className="text-muted-foreground">Latest cases from your professional network</p>
          </div>
          {isAuthenticated && (
            <Button className="gap-2" data-testid="button-new-case" onClick={handleNewCase}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Case</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48" data-testid="select-filter">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="pulmonology">Pulmonology</SelectItem>
                <SelectItem value="gastro">Gastroenterology</SelectItem>
                <SelectItem value="endo">Endocrinology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="mb-6">
          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
            {/* Chat Header - Only show when chat is started */}
            {isAiChatStarted && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b p-3 sm:p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate">AI Medical Assistant</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Ask me anything about medical cases, drugs, or CME</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAiChat}
                  className="text-xs shrink-0 h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </div>
            )}

            {/* Chat Messages - Only show when chat is started */}
            {isAiChatStarted && (
              <div
                ref={setAiChatContainerRef}
                className="h-[300px] sm:h-[350px] md:h-[400px] overflow-y-auto p-3 sm:p-4 bg-background space-y-3 sm:space-y-4"
              >
                {aiMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}
                  >
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                      <AvatarFallback className={`text-xs sm:text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                        {message.role === 'user' ? (
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[80%]`}>
                      <div
                        className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-primary/10'
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isAiLoading && (
                  <div className="flex gap-2 sm:gap-3">
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-card border border-primary/10 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Input - Always visible */}
            <div className={`p-3 sm:p-4 bg-card/50 ${!isAiChatStarted ? 'border-0' : 'border-t'}`}>
              {!isAiChatStarted && (
                <div className="mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                  <span className="truncate">Ask ScrubSociety AI for medical suggestions, case insights, drug information...</span>
                </div>
              )}
              {aiError && (
                <Alert variant="destructive" className="mb-2 sm:mb-3">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-xs">{aiError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleAiSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder={isAiChatStarted ? "Type your message..." : "Ask me anything about medical cases, drugs, or CME..."}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const form = e.currentTarget.closest('form');
                        if (form) {
                          form.requestSubmit();
                        }
                      }
                    }}
                    className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none pr-10 sm:pr-12 text-xs sm:text-sm"
                    rows={2}
                  />
                  {isAiChatStarted && (
                    <div className="absolute right-2 bottom-1.5 sm:bottom-2 text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] shrink-0"
                  disabled={isAiLoading || !aiQuery.trim()}
                >
                  {isAiLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading cases...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? `Failed to load cases: ${error.message}`
                : 'Failed to load cases. Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Cases List */}
        {!isLoading && !isError && (
          <>
            {cases.length > 0 ? (
              <>
                <div className="space-y-4">
                  {cases.map((caseItem) => (
                    <CaseCard 
                      key={caseItem.id} 
                      id={caseItem.id}
                      doctorName={caseItem.doctorName}
                      doctorSpecialty={caseItem.doctorSpecialty}
                      doctorAvatar={caseItem.doctorAvatar}
                      timeAgo={caseItem.timeAgo}
                      title={caseItem.title}
                      content={caseItem.content}
                      tags={caseItem.tags}
                      likes={caseItem.likes}
                      comments={caseItem.comments}
                      image={caseItem.image}
                      isLoggedIn={isAuthenticated}
                      onEdit={handleEditCase}
                      onDelete={handleDeleteCase}
                      onClick={() => {
                        setSelectedCase(caseItem);
                        setShowCommentsOnOpen(false);
                        setDialogOpen(true);
                      }}
                      onCommentClick={() => {
                        setSelectedCase(caseItem);
                        setShowCommentsOnOpen(true);
                        setDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
                <CaseDetailsDialog
                  caseData={selectedCase}
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                      setShowCommentsOnOpen(false);
                    }
                  }}
                  showCommentsOnOpen={showCommentsOnOpen}
                />
                
                <CaseFormDialog
                  open={formDialogOpen}
                  onOpenChange={setFormDialogOpen}
                  caseData={editingCase}
                  onSubmit={handleFormSubmit}
                  isLoading={createCaseMutation.isPending || updateCaseMutation.isPending}
                />

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Case</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this case? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteCaseMutation.isPending}
                      >
                        {deleteCaseMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No cases found.</p>
                <Button onClick={() => setPage(1)} variant="outline">
                  Refresh
                </Button>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading}
                  data-testid="button-load-more"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Cases'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

