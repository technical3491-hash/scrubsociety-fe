'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  icon: LucideIcon;
  metric?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export default function DashboardWidget({
  title,
  icon: Icon,
  metric,
  description,
  actionLabel,
  onAction,
  children,
}: DashboardWidgetProps) {
  return (
    <Card className="p-6 rounded-2xl" data-testid={`widget-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>

      {metric && (
        <div className="mb-2">
          <p className="text-3xl font-bold" data-testid="text-metric">{metric}</p>
        </div>
      )}

      {description && (
        <p className="text-sm text-muted-foreground mb-4" data-testid="text-description">{description}</p>
      )}

      {children}

      {actionLabel && onAction && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onAction}
          data-testid="button-widget-action"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
