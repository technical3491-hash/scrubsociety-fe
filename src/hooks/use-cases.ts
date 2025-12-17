'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCases, GetCasesParams, GetCasesResponse, createCase, updateCase, deleteCase, CaseFormData, toggleLike, getLikeStatus, getComments, addComment, CommentData, Comment } from '@/lib/api/cases';

/**
 * React Query hook to fetch cases with pagination
 */
export function useCases(params: GetCasesParams = {}) {
  const { filter, limit = 10 } = params;
  
  return useQuery<GetCasesResponse>({
    queryKey: ['cases', filter, params.page, limit],
    queryFn: () => getCases(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });
}

/**
 * React Query hook to fetch cases with infinite scroll/pagination
 */
export function useInfiniteCases(params: Omit<GetCasesParams, 'page'> = {}) {
  const { filter, limit = 10 } = params;
  
  return useInfiniteQuery({
    queryKey: ['cases', 'infinite', filter, limit],
    queryFn: ({ pageParam }: { pageParam: number }) => getCases({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * React Query mutation hook to create a case
 */
export function useCreateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CaseFormData) => createCase(data),
    onSuccess: () => {
      // Invalidate and refetch cases
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * React Query mutation hook to update a case
 */
export function useUpdateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CaseFormData }) => updateCase(id, data),
    onSuccess: () => {
      // Invalidate and refetch cases
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * React Query mutation hook to delete a case
 */
export function useDeleteCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCase(id),
    onSuccess: () => {
      // Invalidate and refetch cases
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * React Query hook to get like status for a case
 */
export function useLikeStatus(caseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['case', caseId, 'like'],
    queryFn: () => getLikeStatus(caseId),
    enabled: enabled && !!caseId,
    staleTime: 30000,
  });
}

/**
 * React Query mutation hook to toggle like on a case
 */
export function useToggleLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (caseId: string) => toggleLike(caseId),
    onSuccess: (data, caseId) => {
      // Update the like status in cache
      queryClient.setQueryData(['case', caseId, 'like'], data);
      // Invalidate cases list to update like counts
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      // Invalidate user total likes to update the count
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * React Query hook to get comments for a case
 */
export function useComments(caseId: string, enabled: boolean = true) {
  return useQuery<Comment[]>({
    queryKey: ['case', caseId, 'comments'],
    queryFn: () => getComments(caseId),
    enabled: enabled && !!caseId,
    staleTime: 30000,
  });
}

/**
 * React Query mutation hook to add a comment
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: CommentData }) => addComment(caseId, data),
    onSuccess: (_, variables) => {
      // Invalidate comments to refetch
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId, 'comments'] });
      // Invalidate cases list to update comment counts
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

/**
 * React Query hook to get user's total likes count
 */
export function useUserTotalLikes(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, 'total-likes'],
    queryFn: async () => {
      if (!userId) return 0;
      
      // Fetch all user's cases
      let totalLikes = 0;
      let page = 1;
      const limit = 100; // Fetch in larger batches
      let hasMore = true;
      
      while (hasMore) {
        const response = await getCases({ userId, page, limit });
        totalLikes += response.cases.reduce((sum, caseItem) => sum + (caseItem.likes || 0), 0);
        hasMore = response.hasMore;
        page++;
        
        // Safety limit to prevent infinite loops
        if (page > 10) break;
      }
      
      return totalLikes;
    },
    enabled: !!userId,
    staleTime: 60000, // Cache for 1 minute
  });
}

