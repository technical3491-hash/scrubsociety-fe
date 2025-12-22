'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import DrugIntelligencePanel from '@/components/prescriptions/DrugIntelligencePanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalyzePrescription, usePrescriptions, usePrescription, useDeletePrescription } from '@/hooks/prescriptions';
import { AnalyzePrescriptionInput, PrescriptionAnalysis } from '@/lib/api/prescriptions';
import { FileText, History, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysis | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const analyzeMutation = useAnalyzePrescription();
  const { data: prescriptionsData, isLoading: isLoadingPrescriptions } = usePrescriptions();
  const { data: selectedPrescription } = usePrescription(selectedPrescriptionId);
  const deleteMutation = useDeletePrescription();

  const handleAnalyze = async (data: AnalyzePrescriptionInput) => {
    try {
      const result = await analyzeMutation.mutateAsync(data);
      setAnalysisResult(result);
      setActiveTab('results');
      toast({
        title: 'Prescription Analyzed',
        description: 'Analysis completed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze prescription',
        variant: 'destructive',
      });
    }
  };

  const handleViewPrescription = (id: string) => {
    setSelectedPrescriptionId(id);
    setActiveTab('results');
  };

  const handleDelete = async () => {
    if (!prescriptionToDelete) return;
    try {
      await deleteMutation.mutateAsync(prescriptionToDelete);
      toast({
        title: 'Prescription Deleted',
        description: 'Prescription has been deleted successfully',
      });
      setDeleteDialogOpen(false);
      setPrescriptionToDelete(null);
      if (selectedPrescriptionId === prescriptionToDelete) {
        setSelectedPrescriptionId(null);
        setAnalysisResult(null);
      }
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete prescription',
        variant: 'destructive',
      });
    }
  };

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

  // Use selected prescription if available, otherwise use analysis result
  const currentAnalysis = selectedPrescription?.analysisResult
    ? {
        prescription: selectedPrescription,
        analysis: selectedPrescription.analysisResult,
      }
    : analysisResult;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Prescription Drug Intelligence</h1>
            <p className="text-muted-foreground">
              Analyze prescriptions for drug verification, safety alerts, interactions, and regulatory compliance
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">
                <FileText className="w-4 h-4 mr-2" />
                New Prescription
              </TabsTrigger>
              <TabsTrigger value="results">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Analysis Results
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6">
              <PrescriptionForm
                onSubmit={handleAnalyze}
                isLoading={analyzeMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              {currentAnalysis ? (
                <div className="space-y-6">
                  {/* Prescription Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Prescription Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Patient Name</p>
                          <p className="font-medium">{currentAnalysis.prescription.patientName}</p>
                        </div>
                        {currentAnalysis.prescription.patientAge && (
                          <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium">{currentAnalysis.prescription.patientAge} years</p>
                          </div>
                        )}
                        {currentAnalysis.prescription.patientGender && (
                          <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{currentAnalysis.prescription.patientGender}</p>
                          </div>
                        )}
                        {currentAnalysis.prescription.diagnosis && (
                          <div>
                            <p className="text-sm text-muted-foreground">Diagnosis</p>
                            <p className="font-medium">{currentAnalysis.prescription.diagnosis}</p>
                          </div>
                        )}
                      </div>
                      {currentAnalysis.prescription.patientAllergies && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Known Allergies</p>
                          <p className="font-medium text-orange-600 dark:text-orange-400">
                            {currentAnalysis.prescription.patientAllergies}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Intelligence Panel */}
                  <DrugIntelligencePanel analysis={currentAnalysis.analysis} />
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No analysis results available. Please analyze a prescription first.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {isLoadingPrescriptions ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading prescriptions...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : prescriptionsData?.prescriptions && prescriptionsData.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptionsData.prescriptions.map((prescription) => (
                    <Card key={prescription._id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                              {prescription.analysisResult?.overallRisk && (
                                <Badge className={getRiskColor(prescription.analysisResult.overallRisk)}>
                                  {prescription.analysisResult.overallRisk} RISK
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {prescription.patientAge && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Age</p>
                                  <p className="text-sm font-medium">{prescription.patientAge} years</p>
                                </div>
                              )}
                              {prescription.diagnosis && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                                  <p className="text-sm font-medium">{prescription.diagnosis}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-muted-foreground">Drugs</p>
                                <p className="text-sm font-medium">{prescription.items.length} drugs</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="text-sm font-medium">
                                  {formatDistanceToNow(new Date(prescription.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPrescription(prescription._id)}
                              >
                                View Analysis
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPrescriptionToDelete(prescription._id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No prescription history found.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prescription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prescription? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

