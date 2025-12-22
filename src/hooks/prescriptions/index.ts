import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  analyzePrescription,
  searchDrugs,
  getDrugIntelligence,
  getUserPrescriptions,
  getPrescriptionById,
  deletePrescription,
  AnalyzePrescriptionInput,
} from '@/lib/api/prescriptions';

/**
 * Hook to analyze a prescription
 */
export function useAnalyzePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AnalyzePrescriptionInput) => analyzePrescription(input),
    onSuccess: () => {
      // Invalidate prescriptions list
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

/**
 * Hook to search drugs
 */
export function useSearchDrugs(query: string) {
  return useQuery({
    queryKey: ['drugs', 'search', query],
    queryFn: () => searchDrugs(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get drug intelligence
 */
export function useDrugIntelligence(rxcui: string | null) {
  return useQuery({
    queryKey: ['drugs', 'intelligence', rxcui],
    queryFn: () => getDrugIntelligence(rxcui!),
    enabled: !!rxcui,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get user prescriptions
 */
export function usePrescriptions(params?: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'analyzed' | 'verified' | 'issued';
}) {
  return useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => getUserPrescriptions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get prescription by ID
 */
export function usePrescription(id: string | null) {
  return useQuery({
    queryKey: ['prescriptions', id],
    queryFn: () => getPrescriptionById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to delete prescription
 */
export function useDeletePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePrescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

