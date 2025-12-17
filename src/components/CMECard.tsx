import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award } from "lucide-react";

interface CMECardProps {
  title: string;
  description: string;
  duration: string;
  credits: number;
  category: string;
  imageUrl?: string;
}

export default function CMECard({
  title,
  description,
  duration,
  credits,
  category,
  imageUrl,
}: CMECardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl hover-elevate" data-testid={`card-cme-${title}`}>
      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Award className="w-16 h-16 text-primary opacity-40" />
        )}
        <Badge className="absolute top-3 right-3 bg-primary" data-testid="badge-category">
          {category}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base mb-2 line-clamp-2" data-testid="text-cme-title">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid="text-cme-description">
          {description}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            <span>{credits} Credits</span>
          </div>
        </div>
        <Button variant="default" className="w-full" data-testid="button-start-course">
          Start Course
        </Button>
      </div>
    </Card>
  );
}
