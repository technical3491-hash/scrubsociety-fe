import { getAuthHeaders } from './auth';
import { env } from '@/config/env';

export interface Drug {
  _id: string;
  name: string;
  genericName: string;
  drugClass?: string;
  indication: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  contraindications?: string[];
  warnings?: string[];
  sideEffects?: string[];
  interactions?: string[];
  pregnancyCategory?: string;
  safetyStatus: 'safe' | 'caution' | 'contraindicated' | 'warning';
  manufacturer?: string;
  price?: number;
  availability: 'available' | 'limited' | 'unavailable';
  prescriptionRequired: boolean;
  tags?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetDrugsParams {
  search?: string;
  drugClass?: string;
  safetyStatus?: 'safe' | 'caution' | 'contraindicated' | 'warning';
  availability?: 'available' | 'limited' | 'unavailable';
  prescriptionRequired?: boolean;
  page?: number;
  limit?: number;
}

export interface GetDrugsResponse {
  drugs: Drug[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const API_BASE_URL = `${env.apiUrl}/api/drugs`;

/**
 * Get all drugs with filtering and pagination
 */
export async function getDrugs(params: GetDrugsParams = {}): Promise<GetDrugsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.drugClass) queryParams.append('drugClass', params.drugClass);
  if (params.safetyStatus) queryParams.append('safetyStatus', params.safetyStatus);
  if (params.availability) queryParams.append('availability', params.availability);
  if (params.prescriptionRequired !== undefined) {
    queryParams.append('prescriptionRequired', params.prescriptionRequired.toString());
  }
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch drugs: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Drug[]> = await response.json();
  return {
    drugs: apiResponse.data,
    pagination: apiResponse.pagination || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  };
}

/**
 * Get drug by ID
 */
export async function getDrugById(id: string): Promise<Drug> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch drug: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Drug> = await response.json();
  return apiResponse.data;
}

/**
 * Search drugs (autocomplete)
 */
export async function searchDrugs(query: string, limit: number = 10): Promise<Drug[]> {
  const url = new URL(`${API_BASE_URL}/search`);
  url.searchParams.append('q', query);
  url.searchParams.append('limit', limit.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to search drugs: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Drug[]> = await response.json();
  return apiResponse.data;
}

/**
 * Get drug classes
 */
export async function getDrugClasses(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/classes`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to fetch drug classes: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<string[]> = await response.json();
  return apiResponse.data;
}

/**
 * Create a new drug
 */
export async function createDrug(drug: Omit<Drug, '_id' | 'createdAt' | 'updatedAt'>): Promise<Drug> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(drug),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to create drug: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Drug> = await response.json();
  return apiResponse.data;
}

/**
 * Update a drug
 */
export async function updateDrug(id: string, drug: Partial<Drug>): Promise<Drug> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(drug),
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to update drug: ${response.status} ${text}`);
  }

  const apiResponse: ApiResponse<Drug> = await response.json();
  return apiResponse.data;
}

/**
 * Delete a drug
 */
export async function deleteDrug(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text() || response.statusText;
    throw new Error(`Failed to delete drug: ${response.status} ${text}`);
  }
}

