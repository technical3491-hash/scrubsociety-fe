'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  sendConnectionRequest,
  getConnectionRequests,
  updateConnectionRequest,
  getConnections,
  cancelConnectionRequest,
  User,
  ConnectionRequest,
  Connection,
} from '@/lib/api/connections';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch all users
 */
export function useAllUsers(searchQuery?: string) {
  return useQuery({
    queryKey: ['users', 'all', searchQuery],
    queryFn: () => getAllUsers(searchQuery),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    retry: false, // Don't retry on 404 errors
    enabled: true, // Can be conditionally enabled if needed
    // Note: onError is deprecated in React Query v5, use error handling in components instead
  });
}

/**
 * Hook to fetch connection requests
 */
export function useConnectionRequests(type: 'sent' | 'received' | 'all' = 'all') {
  return useQuery({
    queryKey: ['connectionRequests', type],
    queryFn: () => getConnectionRequests(type),
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to fetch accepted connections
 */
export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: () => getConnections(),
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to send a connection request
 */
export function useSendConnectionRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (recipientId: string) => sendConnectionRequest(recipientId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      toast({
        title: 'Success',
        description: 'Connection request sent successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to accept or reject a connection request
 */
export function useUpdateConnectionRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) =>
      updateConnectionRequest(requestId, status),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast({
        title: 'Success',
        description: `Connection request ${variables.status} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update connection request',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to cancel a connection request
 */
export function useCancelConnectionRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (requestId: string) => cancelConnectionRequest(requestId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast({
        title: 'Success',
        description: 'Connection request cancelled successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel connection request',
        variant: 'destructive',
      });
    },
  });
}

