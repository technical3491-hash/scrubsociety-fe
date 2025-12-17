'use client';

import { Heart, MessageCircle, Share2, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useToggleLike, useLikeStatus } from "@/hooks/use-cases";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface CaseCardProps {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  timeAgo?: string;
  title: string;
  content: string;
  tags?: string[];
  likes: number;
  comments: number;
  image?: string;
  onClick?: () => void;
  onCommentClick?: () => void;
  isLoggedIn?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CaseCard({
  id,
  doctorName,
  doctorSpecialty,
  doctorAvatar,
  timeAgo,
  title,
  content,
  tags = [],
  likes,
  comments,
  image,
  onClick,
  onCommentClick,
  isLoggedIn = false,
  onEdit,
  onDelete,
}: CaseCardProps) {
  const { toast } = useToast();
  const toggleLikeMutation = useToggleLike();
  const { data: likeStatus, isLoading: isLoadingLike } = useLikeStatus(id, isLoggedIn);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  // Update like status from API when available
  useEffect(() => {
    if (likeStatus) {
      setLiked(likeStatus.liked);
      setLikeCount(likeStatus.likes);
    } else {
      // Use the initial likes count from props when likeStatus is not available
      setLiked(false);
      setLikeCount(likes);
    }
  }, [likeStatus, likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast({
        title: 'Login required',
        description: 'Please login to like cases',
        variant: 'default',
      });
      return;
    }

    try {
      await toggleLikeMutation.mutateAsync(id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle like',
        variant: 'destructive',
      });
    }
  };
  
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast({
        title: 'Login required',
        description: 'Please login to comment on cases',
        variant: 'default',
      });
      return;
    }

    // Use onCommentClick if provided, otherwise fall back to onClick
    if (onCommentClick) {
      onCommentClick();
    } else {
      onClick?.();
    }
  };
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const initials = (doctorName || 'User')
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className="p-4 sm:p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 border border-primary/20 bg-gradient-to-br from-card to-background" 
      onClick={onClick}
      data-testid={`card-case-${title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={doctorAvatar} alt={doctorName || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base" data-testid="text-doctor-name">{doctorName || 'Unknown User'}</h3>
            <p className="text-sm text-muted-foreground">{doctorSpecialty || 'Unknown Specialty'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {timeAgo && <span className="text-sm text-muted-foreground">{timeAgo}</span>}
          {isLoggedIn && (
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(id);
                }}
                data-testid="button-edit-case"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                }}
                data-testid="button-delete-case"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2" data-testid="text-case-title">{title}</h2>
      <p className="text-base text-foreground mb-3 leading-relaxed line-clamp-3" data-testid="text-case-content">
        {content.length > 200 ? `${content.substring(0, 200)}...` : content}
      </p>

      {/* Case Image */}
      {image && (
        <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden mb-4 bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${liked ? "text-destructive" : ""}`}
            onClick={handleLike}
            disabled={toggleLikeMutation.isPending || isLoadingLike}
            data-testid="button-like"
          >
            {toggleLikeMutation.isPending || isLoadingLike ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            )}
            <span className="text-sm">{likeCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2" 
            onClick={handleComment}
            data-testid="button-comment"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{comments}</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={handleButtonClick}
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Share</span>
        </Button>
      </div>
    </Card>
  );
}
