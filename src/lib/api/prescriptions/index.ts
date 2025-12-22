import { env } from '@/config/env';
import { getAuthHeaders } from '../auth';

export interface PrescriptionItem {
  drugName: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity?: number;
  instructions?: string;
}

export interface AnalyzePrescriptionInput {
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  patientWeight?: number;
  patientAllergies?: string;
  diagnosis?: string;
  notes?: string;
  items: PrescriptionItem[];
}

export interface DrugVerification {
  drugName: string;
  normalizedName: string;
  rxcui: string | null;
  verificationStatus: 'verified' | 'unverified' | 'flagged';
  genericName: string | null;
  brandName: string | null;
}

export interface SafetyAlert {
  drugName: string;
  rxcui: string | null;
  adverseEvents: Array<{
    event: string;
    frequency: number;
    severity: 'low' | 'moderate' | 'high' | 'serious';
    warningLevel: 'LOW' | 'MODERATE' | 'HIGH';
  }>;
  overallWarningLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated';
  clinicalDescription: string;
  mechanism?: string;
  management?: string;
}

export interface RegulatoryStatus {
  drugName: string;
  rxcui: string | null;
  cdsco: {
    status: 'approved' | 'not_found' | 'pending';
    registrationNumber?: string;
    notes?: string;
  };
  ayush: {
    isAYUSH: boolean;
    ayushType?: 'ayurveda' | 'unani' | 'siddha' | 'homeopathy';
    status: 'approved' | 'not_found';
    notes?: string;
  };
  overallStatus: 'approved' | 'ayush' | 'not_found';
}

export interface PrescriptionAnalysis {
  prescription: {
    _id: string;
    userId: string;
    patientName: string;
    patientAge?: number;
    patientGender?: 'male' | 'female' | 'other';
    patientWeight?: number;
    patientAllergies?: string;
    diagnosis?: string;
    notes?: string;
    items: Array<PrescriptionItem & {
      normalizedName?: string;
      rxcui?: string;
      verificationStatus?: 'verified' | 'unverified' | 'flagged';
    }>;
    status: 'draft' | 'analyzed' | 'verified' | 'issued';
    analysisResult?: {
      drugVerification: DrugVerification[];
      safetyAlerts: SafetyAlert[];
      interactions: DrugInteraction[];
      regulatoryStatus: RegulatoryStatus[];
      overallRisk: 'LOW' | 'MODERATE' | 'HIGH';
    };
    createdAt: string;
    updatedAt: string;
  };
  analysis: {
    drugVerification: DrugVerification[];
    safetyAlerts: SafetyAlert[];
    interactions: DrugInteraction[];
    regulatoryStatus: RegulatoryStatus[];
    overallRisk: 'LOW' | 'MODERATE' | 'HIGH';
  };
}

export interface DrugSearchResult {
  name: string;
  rxcui: string | null;
  genericName: string | null;
  brandName: string | null;
}

export interface DrugIntelligence {
  drug: {
    _id: string;
    rxcui: string;
    name: string;
    genericName?: string;
    brandName?: string;
    drugType: 'generic' | 'brand' | 'ingredient';
  };
  safety: {
    adverseEvents: Array<{
      event: string;
      frequency: number;
      severity: 'low' | 'moderate' | 'high' | 'serious';
      warningLevel: 'LOW' | 'MODERATE' | 'HIGH';
    }>;
    overallWarningLevel: 'LOW' | 'MODERATE' | 'HIGH';
  };
  regulatory: {
    cdsco: {
      status: 'approved' | 'not_found' | 'pending';
      registrationNumber?: string;
      notes?: string;
    };
    ayush: {
      isAYUSH: boolean;
      ayushType?: 'ayurveda' | 'unani' | 'siddha' | 'homeopathy';
      status: 'approved' | 'not_found';
      notes?: string;
    };
    overallStatus: 'approved' | 'ayush' | 'not_found';
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const API_BASE_URL = `${env.apiUrl}/api`;

/**
 * Analyze prescription
 */
export async function analyzePrescription(
  input: AnalyzePrescriptionInput
): Promise<PrescriptionAnalysis> {
  const response = await fetch(`${API_BASE_URL}/drug-intelligence/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to analyze prescription: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<PrescriptionAnalysis> = await response.json();
  return apiResponse.data;
}

/**
 * Search drugs
 */
export async function searchDrugs(query: string): Promise<DrugSearchResult[]> {
  const url = new URL(`${API_BASE_URL}/drug/search`);
  url.searchParams.append('q', query);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to search drugs: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<DrugSearchResult[]> = await response.json();
  return apiResponse.data;
}

/**
 * Get drug intelligence
 */
export async function getDrugIntelligence(rxcui: string): Promise<DrugIntelligence> {
  const response = await fetch(`${API_BASE_URL}/drug/${rxcui}/intelligence`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to get drug intelligence: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<DrugIntelligence> = await response.json();
  return apiResponse.data;
}

/**
 * Get user prescriptions
 */
export async function getUserPrescriptions(params?: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'analyzed' | 'verified' | 'issued';
}): Promise<{
  prescriptions: PrescriptionAnalysis['prescription'][];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const url = new URL(`${API_BASE_URL}/drug-intelligence`);
  if (params?.page) url.searchParams.append('page', params.page.toString());
  if (params?.limit) url.searchParams.append('limit', params.limit.toString());
  if (params?.status) url.searchParams.append('status', params.status);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to get prescriptions: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<PrescriptionAnalysis['prescription'][]> & {
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } = await response.json();
  
  return {
    prescriptions: apiResponse.data,
    pagination: apiResponse.pagination || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  };
}

/**
 * Get prescription by ID
 */
export async function getPrescriptionById(id: string): Promise<PrescriptionAnalysis['prescription']> {
  const response = await fetch(`${API_BASE_URL}/drug-intelligence/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to get prescription: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<PrescriptionAnalysis['prescription']> = await response.json();
  return apiResponse.data;
}

/**
 * Delete prescription
 */
export async function deletePrescription(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/drug-intelligence/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to delete prescription: ${response.status} ${text}`);
  }
}

