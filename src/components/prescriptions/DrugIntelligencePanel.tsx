'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info, Pill } from 'lucide-react';
import {
  PrescriptionAnalysis,
  DrugVerification,
  SafetyAlert,
  DrugInteraction,
  RegulatoryStatus,
} from '@/lib/api/prescriptions';

interface DrugIntelligencePanelProps {
  analysis: PrescriptionAnalysis['analysis'];
}

export default function DrugIntelligencePanel({ analysis }: DrugIntelligencePanelProps) {
  const { drugVerification, safetyAlerts, interactions, regulatoryStatus, overallRisk } = analysis;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'MODERATE':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'HIGH':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'contraindicated':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'severe':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'mild':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWarningLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      case 'MODERATE':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <Card className={getRiskColor(overallRisk)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {overallRisk === 'HIGH' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : overallRisk === 'MODERATE' ? (
                <Info className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Overall Risk Assessment
            </CardTitle>
            <Badge className={getRiskColor(overallRisk)}>{overallRisk}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {overallRisk === 'HIGH'
              ? 'This prescription has high-risk factors. Please review carefully before issuing.'
              : overallRisk === 'MODERATE'
              ? 'This prescription has moderate-risk factors. Review recommended.'
              : 'This prescription appears to be low risk. Standard monitoring recommended.'}
          </p>
        </CardContent>
      </Card>

      {/* Drug Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Drug Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {drugVerification.map((drug, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{drug.drugName}</p>
                  {drug.normalizedName !== drug.drugName && (
                    <p className="text-sm text-muted-foreground">
                      Normalized: {drug.normalizedName}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    drug.verificationStatus === 'verified'
                      ? 'default'
                      : drug.verificationStatus === 'flagged'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {drug.verificationStatus === 'verified' ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : drug.verificationStatus === 'flagged' ? (
                    <XCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {drug.verificationStatus.toUpperCase()}
                </Badge>
              </div>
              {drug.rxcui && (
                <div className="text-xs text-muted-foreground">RXCUI: {drug.rxcui}</div>
              )}
              {drug.genericName && (
                <div className="text-xs text-muted-foreground">Generic: {drug.genericName}</div>
              )}
              {drug.brandName && (
                <div className="text-xs text-muted-foreground">Brand: {drug.brandName}</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety Alerts */}
      {safetyAlerts.some((alert) => alert.adverseEvents.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Safety Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {safetyAlerts.map((alert, index) => {
              if (alert.adverseEvents.length === 0) return null;
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.drugName}</p>
                    <Badge className={getWarningLevelColor(alert.overallWarningLevel)}>
                      {alert.overallWarningLevel} RISK
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Common Adverse Events:</p>
                    <div className="space-y-1">
                      {alert.adverseEvents.slice(0, 5).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                        >
                          <span>{event.event}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.frequency} reports
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Drug Interactions */}
      {interactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Drug Interactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interactions.map((interaction, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 space-y-2 ${getSeverityColor(interaction.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {interaction.drug1} + {interaction.drug2}
                  </p>
                  <Badge className={getSeverityColor(interaction.severity)}>
                    {interaction.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm">{interaction.clinicalDescription}</p>
                {interaction.mechanism && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Mechanism:</strong> {interaction.mechanism}
                  </p>
                )}
                {interaction.management && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Management:</strong> {interaction.management}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Regulatory Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Regulatory Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {regulatoryStatus.map((status, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <p className="font-medium">{status.drugName}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">CDSCO</p>
                  <Badge
                    variant={
                      status.cdsco.status === 'approved'
                        ? 'default'
                        : status.cdsco.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {status.cdsco.status === 'approved' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {status.cdsco.status.toUpperCase()}
                  </Badge>
                  {status.cdsco.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{status.cdsco.notes}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">AYUSH</p>
                  {status.ayush.isAYUSH ? (
                    <>
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {status.ayush.ayushType?.toUpperCase() || 'APPROVED'}
                      </Badge>
                      {status.ayush.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{status.ayush.notes}</p>
                      )}
                    </>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      NOT FOUND
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Medical Disclaimer:</strong> This analysis is for informational purposes only
            and should not replace professional medical judgment. Always verify drug information
            and consult with healthcare professionals before making prescribing decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

