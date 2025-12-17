'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Users, Pill, GraduationCap, Shield, TrendingUp, Search, Sparkles, Loader2, AlertCircle, Send, Trash2, Bot, User, ChevronLeft, ChevronRight } from "lucide-react";
import CaseCard from "@/components/CaseCard";
import Navbar from "@/components/layout/Navbar";
import { queryAI, ChatMessage } from "@/lib/api/ai";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function Landing() {
  const [featuresApi, setFeaturesApi] = useState<CarouselApi | undefined>(undefined);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [featureCount, setFeatureCount] = useState(0);
  const [casesApi, setCasesApi] = useState<CarouselApi | undefined>(undefined);
  const [currentCase, setCurrentCase] = useState(0);
  const [featuresImageApi, setFeaturesImageApi] = useState<CarouselApi | undefined>(undefined);
  const [casesImageApi, setCasesImageApi] = useState<CarouselApi | undefined>(undefined);
  const [aiQuery, setAiQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [chatContainerRef, setChatContainerRef] = useState<HTMLDivElement | null>(null);
  const [isChatStarted, setIsChatStarted] = useState(false);

  useEffect(() => {
    if (!featuresApi) return;
    setFeatureCount(featuresApi.scrollSnapList().length);
    setCurrentFeature(featuresApi.selectedScrollSnap());
    featuresApi.on("select", () => setCurrentFeature(featuresApi.selectedScrollSnap()));
  }, [featuresApi]);

  useEffect(() => {
    if (!featuresApi) return;
    const id = setInterval(() => featuresApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [featuresApi]);

  useEffect(() => {
    if (!casesApi) return;
    setCurrentCase(casesApi.selectedScrollSnap());
    casesApi.on("select", () => setCurrentCase(casesApi.selectedScrollSnap()));
  }, [casesApi]);

  useEffect(() => {
    if (!casesApi) return;
    const id = setInterval(() => casesApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [casesApi]);

  useEffect(() => {
    if (!featuresImageApi) return;
    const id = setInterval(() => featuresImageApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [featuresImageApi]);

  useEffect(() => {
    if (!casesImageApi) return;
    const id = setInterval(() => casesImageApi.scrollNext(), 4500);
    return () => clearInterval(id);
  }, [casesImageApi]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef) {
      chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
    }
  }, [messages, chatContainerRef]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: aiQuery.trim(),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsChatStarted(true); // Open chat interface when first message is sent
    const currentQuery = aiQuery.trim();
    setAiQuery("");
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      const response = await queryAI({ 
        query: currentQuery,
        context: 'landing-page-chat',
        messages: updatedMessages, // Pass conversation history including new user message
      });
      
      if (response.success) {
        // Add AI response
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: response.response || response.suggestions.join('\n\n'),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setAiError('No response available. Please try rephrasing your query.');
        // Remove user message if failed
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error('AI search error:', error);
      setAiError(
        error instanceof Error 
          ? error.message 
          : 'Failed to get AI response. Please try again.'
      );
      // Remove user message if failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAiError(null);
    setIsChatStarted(false); // Collapse chat back to input only
  };

  const demoCases = [
    {
      id: "demo-1",
      doctorName: "Dr. Ananya Reddy",
      doctorSpecialty: "Pulmonologist",
      timeAgo: "1 hour ago",
      title: "Difficult Asthma Management in Elderly Patient",
      content: "73-year-old female with severe asthma, history of COPD. Current medications not providing adequate control. Seeking advice on biologic therapy options.",
      tags: ["Pulmonology", "Asthma", "Geriatric"],
      likes: 18,
      comments: 5,
    },
    {
      id: "demo-2",
      doctorName: "Dr. Vikram Singh",
      doctorSpecialty: "Neurologist",
      timeAgo: "3 hours ago",
      title: "Rare Presentation of Multiple Sclerosis",
      content: "32-year-old presenting with progressive vision loss and ataxia. MRI shows demyelinating lesions. Differential diagnosis and treatment approach discussion.",
      tags: ["Neurology", "MS", "Case Study"],
      likes: 32,
      comments: 12,
    },
  ];
  const features = [
    {
      icon: FileText,
      title: "Case Discussions",
      description: "Share and discuss complex medical cases with verified professionals",
    },
    {
      icon: Pill,
      title: "Drug Information",
      description: "Access comprehensive drug safety data and interaction alerts",
    },
    {
      icon: GraduationCap,
      title: "CME & Research",
      description: "Earn CME credits and stay updated with latest medical research",
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with doctors across Allopathy, AYUSH, Pharmacy, and Academia",
    },
    {
      icon: Shield,
      title: "Verified Doctors Only",
      description: "All members are verified healthcare professionals",
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Insights",
      description: "Get intelligent suggestions and clinical decision support",
    },
  ];

  return (
    <div className="min-h-screen vfx-background relative bg-gradient-to-br from-background via-card/30 to-background overflow-hidden">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]" 
           style={{
             backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }}
      />
      
      {/* Geometric Shapes Background */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl pointer-events-none z-[1]" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-[1]"
           style={{
             backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
             backgroundSize: '50px 50px'
           }}
      />
      
      {/* Mature Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background pointer-events-none z-[2]" 
           style={{
             background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)/0.98) 25%, hsl(var(--card)/0.3) 50%, hsl(var(--background)/0.98) 75%, hsl(var(--background)) 100%)'
           }}
      />
      
      {/* VFX Particles */}
      <div className="vfx-particles">
        <div className="vfx-particle" />
        <div className="vfx-particle" />
        <div className="vfx-particle" />
        <div className="vfx-particle" />
      </div>
      
      {/* VFX Glow Effects */}
      <div className="vfx-glow" />
      <div className="vfx-glow" />
      
      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full pointer-events-none z-[1]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-accent/10 to-transparent rounded-tl-full pointer-events-none z-[1]" />
      
      <div className="relative z-10">
        <Navbar isLoggedIn={false} />
      
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground pt-12 relative overflow-hidden">
        {/* Background Design Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 md:mb-10 leading-tight" data-testid="text-hero-title">
              Welcome to <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">ScrubSocietyAI</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-5 md:mb-6 text-primary-foreground/90 leading-relaxed" data-testid="text-hero-subtitle">
              The verified doctor network connecting <span className="text-xs sm:text-sm md:text-base font-semibold">Allopathy</span>, <span className="text-xs sm:text-sm md:text-base font-semibold">AYUSH</span>, <span className="text-xs sm:text-sm md:text-base font-semibold">Pharmacy</span>, and <span className="text-xs sm:text-sm md:text-base font-semibold">Academia</span>.
            </p>
            <p className="text-xs sm:text-sm md:text-base mb-8 sm:mb-10 md:mb-12 text-primary-foreground/80">
              Collaborate, learn, and grow with healthcare professionals worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center items-stretch sm:items-center">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="default" variant="secondary" className="w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 h-10 sm:h-auto" data-testid="button-join-free">
                  Join Free
                </Button>
              </Link>
              <Link href="/explore/cases" className="w-full sm:w-auto">
                <Button
                  size="default"
                  variant="outline"
                  className="w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 h-10 sm:h-auto bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                  data-testid="button-see-demo"
                >
                  Explore Cases
                </Button>
              </Link>
              <Link href="/play-game" className="w-full sm:w-auto">
                <Button
                  size="default"
                  variant="outline"
                  className="w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 h-10 sm:h-auto bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                  data-testid="button-play-game"
                >
                  Play Game
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="default"
                  variant="ghost"
                  className="w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 h-10 sm:h-auto text-primary-foreground hover:bg-primary-foreground/10"
                  data-testid="button-login"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 lg:py-16">
        {/* AI Chat Interface */}
        <div className="mb-8 sm:mb-12 md:mb-16 relative">
          {/* Background decoration for chat section */}
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl blur-xl -z-10" />
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-lg overflow-hidden relative">
              {/* Card background pattern */}
              <div className="absolute inset-0 opacity-[0.01] pointer-events-none"
                   style={{
                     backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
                     backgroundSize: '25px 25px'
                   }}
              />
              {/* Chat Header - Only show when chat is started */}
              {isChatStarted && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b p-3 sm:p-4 flex items-center justify-between gap-2 relative">
                  {/* Header background pattern */}
                  <div className="absolute inset-0 opacity-[0.02]"
                       style={{
                         backgroundImage: `linear-gradient(45deg, hsl(var(--primary)) 1px, transparent 1px)`,
                         backgroundSize: '15px 15px'
                       }}
                  />
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 relative z-10">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl truncate">AI Medical Assistant</h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block">Ask me anything about medical cases, drugs, or CME</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs shrink-0 h-8 sm:h-9 px-2 sm:px-3"
                    data-testid="button-clear-chat"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                </div>
              )}

              {/* Chat Messages - Only show when chat is started */}
              {isChatStarted && (
                <div
                  ref={setChatContainerRef}
                  className="h-[300px] sm:h-[350px] md:h-[400px] overflow-y-auto p-4 sm:p-6 md:p-8 bg-background space-y-4 sm:space-y-5 md:space-y-6"
                  data-testid="chat-messages-container"
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 sm:gap-4 md:gap-5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
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
                          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base leading-relaxed whitespace-pre-wrap break-words">
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
              <div className={`p-3 sm:p-4 bg-card/50 ${!isChatStarted ? 'border-0' : 'border-t'} relative`}>
                {/* Input area background pattern */}
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none"
                     style={{
                       backgroundImage: `linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                       backgroundSize: '20px 20px'
                     }}
                />
                {!isChatStarted && (
                  <div className="mb-2 sm:mb-3 flex items-center gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground relative z-10">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                    <span className="truncate font-medium">Ask ScrubSociety AI for medical suggestions, case insights, drug information...</span>
                  </div>
                )}
                {aiError && (
                  <Alert variant="destructive" className="mb-2 sm:mb-3 relative z-10">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription className="text-[10px] sm:text-xs">{aiError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleAiSearch} className="flex gap-2 relative z-10">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder={isChatStarted ? "Type your message..." : "Ask me anything about medical cases, drugs, or CME..."}
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
                      className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none pr-10 sm:pr-12 text-[11px] sm:text-xs md:text-sm"
                      rows={2}
                      data-testid="input-ai-chat"
                    />
                    {isChatStarted && (
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
                    data-testid="button-ai-send"
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
        </div>

        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-5 md:mb-6">
            Trusted by <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary">50,000+</span> Verified Doctors
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground font-medium mb-2">
            Join the largest verified medical professional network in India
          </p>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground/70 mt-2">
            Connecting healthcare professionals across specialties
          </p>
        </div>

         {/* Features and Cases with Image Areas - Two Row Layout */}
         <div className="mb-8 sm:mb-12 md:mb-16 space-y-6 sm:space-y-8 lg:space-y-10">
           {/* Row 1: Features (Left) + Image (Right) */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
             {/* Features Carousel - Left */}
             <div className="w-full relative">
               {/* Background decoration */}
               <div className="absolute -inset-2 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl blur-sm -z-10" />
               
               <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold mb-6 sm:mb-8 md:mb-10 text-center lg:text-left px-2 sm:px-0">
                 Platform <span className="text-base sm:text-lg md:text-xl lg:text-2xl">Features</span>
               </h2>
               <div className="h-[280px] xs:h-[300px] sm:h-[350px] md:h-[380px]">
                 <Carousel
                   setApi={setFeaturesApi}
                   opts={{ align: "start", loop: true }}
                   className="w-full h-full"
                 >
                   <CarouselContent className="h-full">
                     {features.map((feature, index) => {
                       const Icon = feature.icon;
                       return (
                         <CarouselItem key={index} className="basis-full h-full">
                           <div className="card-3d h-full">
                             <Card className="card-3d-inner border-glow p-3 sm:p-4 rounded-xl h-full flex flex-col justify-center relative overflow-hidden">
                               {/* Card background pattern */}
                               <div className="absolute inset-0 opacity-[0.02]"
                                    style={{
                                      backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
                                      backgroundSize: '20px 20px'
                                    }}
                               />
                               <div className="text-center relative z-10">
                                 <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 shadow-sm">
                                   <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                                 </div>
                                 <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold mb-3 sm:mb-4 md:mb-5">{feature.title}</h3>
                                 <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed px-3 sm:px-4">
                                   {feature.description}
                                 </p>
                               </div>
                             </Card>
                           </div>
                         </CarouselItem>
                       );
                     })}
                   </CarouselContent>
                   <CarouselPrevious className="left-0.5 sm:left-1 bg-background/90 border-glow h-6 w-6 sm:h-7 sm:w-7 z-10" />
                   <CarouselNext className="right-0.5 sm:right-1 bg-background/90 border-glow h-6 w-6 sm:h-7 sm:w-7 z-10" />
                 </Carousel>
                 {/* Dots */}
                 <div className="flex justify-center gap-1.5 mt-2">
                   {features.map((_, i) => (
                     <button
                       key={i}
                       type="button"
                       onClick={() => featuresApi?.scrollTo(i)}
                       className={`h-1.5 sm:h-2 rounded-full transition-all ${i === currentFeature ? "w-6 sm:w-8 bg-primary" : "w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50"}`}
                       aria-label={`Go to feature ${i + 1}`}
                     />
                   ))}
                 </div>
               </div>
             </div>

             {/* Image Area - Right of Features */}
             <div className="w-full">
               <div className="h-[300px] sm:h-[350px] md:h-[380px] rounded-xl border border-primary/20 overflow-hidden relative tilt-animate border-glow bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
                 <Carousel
                   setApi={setFeaturesImageApi}
                   opts={{ align: "start", loop: true }}
                   className="w-full h-full"
                 >
                   <CarouselContent className="h-full -ml-0">
                     {['/images/img_one.jpg', '/images/img_two.jpg', '/images/img_three.jpg'].map((imgSrc, index) => (
                       <CarouselItem key={index} className="basis-full pl-0">
                         <div className="relative w-full h-[300px] sm:h-[350px] md:h-[380px]">
                           <Image
                             src={imgSrc}
                             alt={`Platform Features ${index + 1}`}
                             fill
                             className="object-cover rounded-xl"
                             sizes="(max-width: 1024px) 100vw, 50vw"
                             priority={index === 0}
                           />
                           {/* Overlay gradient */}
                           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-xl z-10" />
                           {/* Decorative pattern overlay */}
                           <div className="absolute inset-0 opacity-[0.05] rounded-xl z-10"
                                style={{
                                  backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
                                  backgroundSize: '25px 25px'
                                }}
                           />
                         </div>
                       </CarouselItem>
                     ))}
                   </CarouselContent>
                 </Carousel>
               </div>
             </div>
           </div>

           {/* Row 2: Image (Left) + Cases (Right) */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
             {/* Image Area - Left of Cases */}
             <div className="w-full order-first lg:order-none">
               <div className="h-[300px] sm:h-[350px] md:h-[380px] rounded-xl border border-primary/20 overflow-hidden relative tilt-animate border-glow bg-gradient-to-br from-accent/5 via-primary/10 to-primary/5">
                 <Carousel
                   setApi={setCasesImageApi}
                   opts={{ align: "start", loop: true }}
                   className="w-full h-full"
                 >
                   <CarouselContent className="h-full -ml-0">
                     {['/images/img_four.jpg', '/images/img_five.jpg', '/images/img_six.jpg'].map((imgSrc, index) => (
                       <CarouselItem key={index} className="basis-full pl-0">
                         <div className="relative w-full h-[300px] sm:h-[350px] md:h-[380px]">
                           <Image
                             src={imgSrc}
                             alt={`Case Discussion ${index + 1}`}
                             fill
                             className="object-cover rounded-xl"
                             sizes="(max-width: 1024px) 100vw, 50vw"
                             priority={index === 0}
                           />
                           {/* Overlay gradient */}
                           <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20 rounded-xl z-10" />
                           {/* Decorative pattern overlay */}
                           <div className="absolute inset-0 opacity-[0.05] rounded-xl z-10"
                                style={{
                                  backgroundImage: `radial-gradient(circle at 3px 3px, hsl(var(--accent)) 1px, transparent 0)`,
                                  backgroundSize: '25px 25px'
                                }}
                           />
                         </div>
                       </CarouselItem>
                     ))}
                   </CarouselContent>
                 </Carousel>
               </div>
             </div>

             {/* Cases Carousel - Right */}
             <div className="relative w-full">
               {/* Background decoration */}
               <div className="absolute -inset-2 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-2xl blur-sm -z-10" />
               
               <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 gap-2 px-2 sm:px-0">
                 <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold">
                   Recent <span className="text-base sm:text-lg md:text-xl lg:text-2xl">Cases</span>
                 </h2>
                 <Link href="/explore/cases">
                   <Button variant="outline" size="sm" className="text-[10px] xs:text-xs h-6 sm:h-7 px-2 sm:px-3 shrink-0" data-testid="button-view-all-cases">
                     <span className="hidden xs:inline">View All</span>
                     <span className="xs:hidden">All</span>
                   </Button>
                 </Link>
               </div>
               <div className="h-[280px] xs:h-[300px] sm:h-[350px] md:h-[380px] relative px-2 sm:px-0">
                 <Carousel
                   setApi={setCasesApi}
                   opts={{ align: "start", loop: true }}
                   className="w-full h-full"
                 >
                   <CarouselContent className="h-full">
                     {demoCases.map((caseItem) => (
                       <CarouselItem key={caseItem.id} className="basis-full h-full">
                         <div className="card-3d h-full">
                           <div className="card-3d-inner h-full">
                             <CaseCard
                               {...caseItem}
                             />
                           </div>
                         </div>
                       </CarouselItem>
                     ))}
                   </CarouselContent>
                 </Carousel>
               </div>
               
               {/* Navigation Controls - Below the card */}
               <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 px-2 sm:px-0">
                 <Button
                   variant="outline"
                   size="icon"
                   onClick={() => casesApi?.scrollPrev()}
                   className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8"
                   aria-label="Previous case"
                   data-testid="button-prev-case"
                 >
                   <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                 </Button>
                 
                 {/* Case Dots */}
                 <div className="flex justify-center gap-1 sm:gap-1.5">
                   {demoCases.map((_, i) => (
                     <button
                       key={i}
                       type="button"
                       onClick={() => casesApi?.scrollTo(i)}
                       className={`h-1.5 sm:h-2 rounded-full transition-all ${
                         i === currentCase
                           ? "w-5 xs:w-6 sm:w-8 bg-primary"
                           : "w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50"
                       }`}
                       aria-label={`Go to case ${i + 1}`}
                     />
                   ))}
                 </div>
                 
                 <Button
                   variant="outline"
                   size="icon"
                   onClick={() => casesApi?.scrollNext()}
                   className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8"
                   aria-label="Next case"
                   data-testid="button-next-case"
                 >
                   <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                 </Button>
               </div>
             </div>
           </div>
         </div>

        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-xl p-8 sm:p-10 md:p-12 lg:p-16 text-center relative overflow-hidden mt-8 sm:mt-12 md:mt-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.02]"
               style={{
                 backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
                 backgroundSize: '30px 30px'
               }}
          />
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-4 w-40 h-40 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 sm:mb-6 md:mb-8">
              Ready to Join <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">ScrubSocietyAI</span>?
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-4 md:mb-5 max-w-2xl mx-auto px-2 font-medium">
              Become part of India's most trusted medical professional network.
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground/80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
              Share knowledge, earn CME credits, and collaborate with verified doctors.
            </p>
            <Link href="/register">
              <Button size="default" className="px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg font-semibold h-11 sm:h-12 md:h-14" data-testid="button-get-started">
                Get Started - <span className="text-xs sm:text-sm md:text-base">It's Free</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-muted/30 border-t mt-12 sm:mt-16 md:mt-20 relative overflow-hidden">
        {/* Footer background pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
             style={{
               backgroundImage: `linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
             }}
        />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 relative z-10">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">
              © <span className="text-xs sm:text-sm md:text-base font-bold">2025</span> ScrubSocietyAI. All rights reserved.
            </p>
            <p className="mt-2 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground/70">
              Connecting healthcare professionals across India
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

