'use client';

import { Heart, MessageCircle, Share2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Case } from "@/lib/api/cases";
import { useToggleLike, useLikeStatus, useComments, useAddComment } from "@/hooks/use-cases";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface CaseDetailsDialogProps {
  caseData: Case | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showCommentsOnOpen?: boolean;
}

export default function CaseDetailsDialog({
  caseData,
  open,
  onOpenChange,
  showCommentsOnOpen = false,
}: CaseDetailsDialogProps) {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { toast } = useToast();
  const toggleLikeMutation = useToggleLike();
  const { data: likeStatus, isLoading: isLoadingLike } = useLikeStatus(caseData?.id || '', isAuthenticated && open);
  const { data: comments = [], isLoading: isLoadingComments } = useComments(caseData?.id || '', isAuthenticated && open);
  const addCommentMutation = useAddComment();
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(caseData?.likes || 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (caseData) {
      setLikeCount(caseData.likes);
      setLiked(false);
      setCommentText("");
      // Auto-show comments if opened from comment button
      setShowComments(showCommentsOnOpen);
    }
  }, [caseData, showCommentsOnOpen]);
  
  // Auto-show comments when dialog opens and showCommentsOnOpen is true
  useEffect(() => {
    if (open && showCommentsOnOpen) {
      setShowComments(true);
    }
  }, [open, showCommentsOnOpen]);

  // Update like status from API when available
  useEffect(() => {
    if (likeStatus) {
      setLiked(likeStatus.liked);
      setLikeCount(likeStatus.likes);
    } else if (!isAuthenticated && caseData) {
      setLiked(false);
      setLikeCount(caseData.likes);
    }
  }, [likeStatus, isAuthenticated, caseData]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to like cases',
        variant: 'default',
      });
      return;
    }

    if (!caseData) return;

    try {
      await toggleLikeMutation.mutateAsync(caseData.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle like',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to comment on cases',
        variant: 'default',
      });
      return;
    }

    if (!caseData || !commentText.trim()) return;

    try {
      const newComment = await addCommentMutation.mutateAsync({
        caseId: caseData.id,
        data: { content: commentText.trim() },
      });
      setCommentText("");
      setShowComments(true);
      
      // Scroll to the new comment after it's added
      setTimeout(() => {
        const commentElement = document.querySelector(`[data-comment-id="${newComment.id}"]`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!caseData) return null;

  const initials = caseData.doctorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] sm:w-full h-[calc(100vh-2rem)] sm:max-h-[90vh] sm:h-auto flex flex-col p-0 top-[1rem] bottom-[1rem] sm:top-[50%] sm:bottom-auto left-[1rem] right-[1rem] sm:left-[50%] sm:right-auto translate-x-[0] sm:translate-x-[-50%] translate-y-[0] sm:translate-y-[-50%] rounded-lg overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 border-b">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                <AvatarImage src={caseData.doctorAvatar} alt={caseData.doctorName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{caseData.doctorName}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{caseData.doctorSpecialty}</p>
              </div>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground sm:ml-auto">{caseData.timeAgo}</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold mt-3 sm:mt-4 pr-8">{caseData.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {caseData.tags && caseData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {caseData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Case Image */}
          {caseData.image && (
            <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden bg-muted">
              <Image
                src={caseData.image}
                alt={caseData.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                unoptimized
              />
            </div>
          )}

          <div className="prose max-w-none">
            <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {caseData.content}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t p-4 sm:p-6 space-y-4 flex-shrink-0 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base sm:text-lg">Comments ({comments.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
              >
                Hide
              </Button>
            </div>
            
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const commentInitials = (comment.userName || 'User')
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  
                  // Check if this comment is from the current user
                  const isCurrentUserComment = currentUser && (
                    comment.userId === currentUser.id || 
                    comment.userName === currentUser.name ||
                    comment.userName === currentUser.email?.split('@')[0]
                  );
                  
                  return (
                    <div 
                      key={comment.id}
                      data-comment-id={comment.id}
                      className={`flex gap-3 p-3 rounded-lg ${
                        isCurrentUserComment 
                          ? 'bg-primary/5 border border-primary/20' 
                          : 'bg-muted/30'
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.userAvatar} alt={comment.userName || 'User'} />
                        <AvatarFallback className="text-xs">{commentInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${isCurrentUserComment ? 'text-primary' : ''}`}>
                            {comment.userName || 'Unknown User'}
                            {isCurrentUserComment && (
                              <span className="ml-2 text-xs text-primary/70">(You)</span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
            )}

            {isAuthenticated && (
              <div className="space-y-2 pt-4 border-t">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 sm:p-6 pt-3 sm:pt-4 border-t flex-shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 sm:gap-2 ${liked ? "text-destructive" : ""}`}
              onClick={handleLike}
              disabled={toggleLikeMutation.isPending || isLoadingLike}
            >
              {toggleLikeMutation.isPending || isLoadingLike ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              )}
              <span className="text-xs sm:text-sm">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 sm:gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">{comments.length} Comments</span>
              <span className="text-xs sm:hidden">{comments.length}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Share2 className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Share</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

