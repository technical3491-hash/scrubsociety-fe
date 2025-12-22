'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Loader2 } from 'lucide-react';
import { AnalyzePrescriptionInput, PrescriptionItem } from '@/lib/api/prescriptions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PrescriptionFormProps {
  onSubmit: (data: AnalyzePrescriptionInput) => Promise<void>;
  isLoading?: boolean;
}

export default function PrescriptionForm({ onSubmit, isLoading }: PrescriptionFormProps) {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | undefined>();
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [patientWeight, setPatientWeight] = useState<number | undefined>();
  const [patientAllergies, setPatientAllergies] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([
    { drugName: '', dose: '', frequency: '', duration: '' },
  ]);

  const addDrug = () => {
    setItems([...items, { drugName: '', dose: '', frequency: '', duration: '' }]);
  };

  const removeDrug = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateDrug = (index: number, field: keyof PrescriptionItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName.trim()) {
      alert('Patient name is required');
      return;
    }

    if (items.some(item => !item.drugName.trim() || !item.dose.trim() || !item.frequency.trim() || !item.duration.trim())) {
      alert('Please fill in all drug details');
      return;
    }

    const data: AnalyzePrescriptionInput = {
      patientName: patientName.trim(),
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender: patientGender || undefined,
      patientWeight: patientWeight ? Number(patientWeight) : undefined,
      patientAllergies: patientAllergies.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      notes: notes.trim() || undefined,
      items: items.map(item => ({
        drugName: item.drugName.trim(),
        dose: item.dose.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
        quantity: item.quantity ? Number(item.quantity) : undefined,
        instructions: item.instructions?.trim() || undefined,
      })),
    };

    await onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Input</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">
                  Patient Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={patientAge || ''}
                  onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Age in years"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientGender">Gender</Label>
                <Select value={patientGender} onValueChange={(value: any) => setPatientGender(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientWeight">Weight (kg)</Label>
                <Input
                  id="patientWeight"
                  type="number"
                  value={patientWeight || ''}
                  onChange={(e) => setPatientWeight(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Weight in kg"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientAllergies">Known Allergies</Label>
              <Textarea
                id="patientAllergies"
                value={patientAllergies}
                onChange={(e) => setPatientAllergies(e.target.value)}
                placeholder="List any known allergies"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis"
                rows={2}
              />
            </div>
          </div>

          {/* Prescribed Drugs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prescribed Drugs</h3>
              <Button type="button" onClick={addDrug} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Drug
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium">Drug {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeDrug(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>
                      Drug Name (Brand or Generic) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={item.drugName}
                      onChange={(e) => updateDrug(index, 'drugName', e.target.value)}
                      placeholder="e.g., Paracetamol or Tylenol"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Dose <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={item.dose}
                      onChange={(e) => updateDrug(index, 'dose', e.target.value)}
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Frequency <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={item.frequency}
                      onChange={(e) => updateDrug(index, 'frequency', e.target.value)}
                      placeholder="e.g., Twice daily"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Duration <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={item.duration}
                      onChange={(e) => updateDrug(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateDrug(index, 'quantity', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Number of units"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Special Instructions</Label>
                    <Input
                      value={item.instructions || ''}
                      onChange={(e) => updateDrug(index, 'instructions', e.target.value)}
                      placeholder="Additional instructions"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Prescription'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

