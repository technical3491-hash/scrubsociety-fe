import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface DrugResultCardProps {
  drugName: string;
  genericName?: string;
  safetyStatus: "safe" | "caution" | "contraindicated" | "warning";
  indication: string;
  warnings?: string[];
}

export default function DrugResultCard({
  drugName,
  genericName,
  safetyStatus,
  indication,
  warnings = [],
}: DrugResultCardProps) {
  const statusConfig = {
    safe: {
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      icon: CheckCircle,
      label: "Safe",
    },
    caution: {
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      icon: AlertCircle,
      label: "Use with Caution",
    },
    warning: {
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      icon: AlertTriangle,
      label: "Warning",
    },
    contraindicated: {
      color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      icon: AlertTriangle,
      label: "Contraindicated",
    },
  };

  const config = statusConfig[safetyStatus];
  const Icon = config.icon;

  return (
    <Card className="p-4 rounded-2xl" data-testid={`card-drug-${drugName.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg" data-testid="text-drug-name">{drugName}</h3>
          {genericName && (
            <p className="text-sm text-muted-foreground">{genericName}</p>
          )}
        </div>
        <Badge className={`${config.color} border`} data-testid="badge-safety-status">
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-muted-foreground mb-1">Indication</p>
        <p className="text-sm" data-testid="text-indication">{indication}</p>
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium text-muted-foreground mb-2">Warnings</p>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
