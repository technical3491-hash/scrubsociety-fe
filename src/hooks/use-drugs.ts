'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDrugs,
  getDrugById,
  searchDrugs,
  getDrugClasses,
  createDrug,
  updateDrug,
  deleteDrug,
  Drug,
  GetDrugsParams,
} from '@/lib/api/drugs';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch drugs with filtering and pagination
 */
export function useDrugs(params: GetDrugsParams = {}) {
  return useQuery({
    queryKey: ['drugs', params],
    queryFn: () => getDrugs(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook to fetch a single drug by ID
 */
export function useDrug(id: string | null) {
  return useQuery({
    queryKey: ['drug', id],
    queryFn: () => {
      if (!id) throw new Error('Drug ID is required');
      return getDrugById(id);
    },
    enabled: !!id,
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to search drugs (autocomplete)
 */
export function useSearchDrugs(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ['drugs', 'search', query, limit],
    queryFn: () => searchDrugs(query, limit),
    enabled: query.length > 0,
    staleTime: 10000,
    gcTime: 300000,
  });
}

/**
 * Hook to fetch drug classes
 */
export function useDrugClasses() {
  return useQuery({
    queryKey: ['drugs', 'classes'],
    queryFn: () => getDrugClasses(),
    staleTime: 300000, // Drug classes don't change often
    gcTime: 600000,
  });
}

/**
 * Hook to create a drug
 */
export function useCreateDrug() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (drug: Omit<Drug, '_id' | 'createdAt' | 'updatedAt'>) => createDrug(drug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      toast({
        title: 'Success',
        description: 'Drug created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create drug',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a drug
 */
export function useUpdateDrug() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, drug }: { id: string; drug: Partial<Drug> }) => updateDrug(id, drug),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      queryClient.invalidateQueries({ queryKey: ['drug', variables.id] });
      toast({
        title: 'Success',
        description: 'Drug updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update drug',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a drug
 */
export function useDeleteDrug() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteDrug(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      toast({
        title: 'Success',
        description: 'Drug deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete drug',
        variant: 'destructive',
      });
    },
  });
}

