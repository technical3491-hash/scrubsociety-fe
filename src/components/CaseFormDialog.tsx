'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { Case, CaseFormData } from "@/lib/api/cases";
import Image from "next/image";
import { summarizeCase } from "@/lib/api/ai";
import { useToast } from "@/hooks/use-toast";

interface CaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: Case | null;
  onSubmit: (data: CaseFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CaseFormDialog({
  open,
  onOpenChange,
  caseData,
  onSubmit,
  isLoading = false,
}: CaseFormDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditMode = !!caseData;

  useEffect(() => {
    if (caseData) {
      setTitle(caseData.title);
      setContent(caseData.content);
      setTags(caseData.tags || []);
      // Set existing image preview if available
      if (caseData.image) {
        setImagePreview(caseData.image);
        setImageFile(null); // Don't set file for existing image
      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    } else {
      // Reset form for new case
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [caseData, open]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on scrollHeight, with a minimum of one line
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
      const minHeight = lineHeight + 16; // padding
      textarea.style.height = `${Math.max(minHeight, textarea.scrollHeight)}px`;
    }
  }, [content, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      // Split by comma and filter out empty strings and duplicates
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));
      
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast({
        title: "No content to summarize",
        description: "Please enter some case content first.",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);
    try {
      const summary = await summarizeCase(content, title || undefined);
      setContent(summary);
      toast({
        title: "Success",
        description: "Case content summarized successfully.",
      });
    } catch (error) {
      console.error("Failed to summarize:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to summarize content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    const data: CaseFormData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags,
      // Include imageFile if a new file was selected
      // If imagePreview is null and there was an existing image, we need to signal removal
      // This will be handled by the API - if no image is sent, it keeps the existing one
      // If we want to remove, we might need to send a special flag or empty string
      ...(imageFile && { image: imageFile }),
    };

    await onSubmit(data as CaseFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] sm:w-full h-[calc(100vh-2rem)] sm:max-h-[90vh] sm:h-auto flex flex-col p-0 top-[1rem] bottom-[1rem] sm:top-[50%] sm:bottom-auto left-[1rem] right-[1rem] sm:left-[50%] sm:right-auto translate-x-[0] sm:translate-x-[-50%] translate-y-[0] sm:translate-y-[-50%] rounded-lg overflow-hidden border-0 shadow-xl">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-3 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {isEditMode ? "Edit Case" : "Create New Case"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-1">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your case about?"
              required
              className="text-lg sm:text-xl font-semibold border-0 border-b border-transparent focus:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-2 h-auto bg-transparent placeholder:text-foreground/50"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="text-sm font-medium text-foreground/80">
                Case Details
              </label>
              {content.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="text-xs h-7 gap-1.5"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI Summarize
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share the details of your case..."
              required
              rows={1}
              className="text-base sm:text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-2 overflow-hidden bg-transparent placeholder:text-foreground/50 !min-h-0"
            />
          </div>

          <div className="space-y-2">
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative w-full">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted/30">
                    <Image
                      src={imagePreview}
                      alt="Case preview"
                      fill
                      className="object-contain"
                      unoptimized={imagePreview.startsWith('http://') || imagePreview.startsWith('https://') || imagePreview.startsWith('blob:')}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors bg-muted/10"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-foreground/60" />
                    <p className="mb-2 text-sm text-foreground/70">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-foreground/60">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              {!imagePreview && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="text-xs sm:text-sm text-foreground/70 hover:text-foreground"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {/* Tags Input Box with Selected Tags Inside */}
            <div className="min-h-[42px] w-full rounded-md bg-transparent px-0 py-2 text-sm flex flex-wrap gap-1.5 items-center">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs sm:text-sm flex items-center gap-1 bg-muted/50 hover:bg-muted"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setTagInput(value);
                  // Auto-add tags when comma is entered
                  if (value.includes(',')) {
                    const parts = value.split(',');
                    const tagsToAdd = parts
                      .slice(0, -1)
                      .map(tag => tag.trim())
                      .filter(tag => tag && !tags.includes(tag));
                    const remainingInput = parts[parts.length - 1].trim();
                    
                    if (tagsToAdd.length > 0) {
                      setTags([...tags, ...tagsToAdd]);
                    }
                    setTagInput(remainingInput);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                    handleRemoveTag(tags[tags.length - 1]);
                  }
                }}
                placeholder={tags.length === 0 ? "Add tags (comma-separated)..." : "Add more tags..."}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-base sm:text-sm placeholder:text-foreground/50 border-0 focus:ring-0"
              />
            </div>
            
            {/* Common Tags Suggestions */}
            <div className="space-y-1.5 pt-2">
              <div className="flex flex-wrap gap-2">
                {['Cardiology', 'Neurology', 'Case Report', 'Emergency', 'Pediatrics', 'Rare Case', 'Treatment', 'Diagnosis'].map((suggestion) => {
                  const isSelected = tags.includes(suggestion);
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveTag(suggestion);
                        } else {
                          if (!tags.includes(suggestion)) {
                            setTags([...tags, suggestion]);
                          }
                        }
                      }}
                      className={`px-2.5 py-1 text-xs sm:text-sm rounded-full transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 hover:bg-muted text-foreground/70 hover:text-foreground'
                      }`}
                    >
                      {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-4 sm:p-6 pt-3 sm:pt-4 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !title.trim() || !content.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Posting..."}
              </>
            ) : (
              isEditMode ? "Update Case" : "Post Case"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

