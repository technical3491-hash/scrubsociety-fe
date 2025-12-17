'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser, type LoginCredentials, type RegisterData, type AuthError, type AuthResponse } from '@/lib/api/auth';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_USER_KEY = 'user';
const LOCAL_STORAGE_TOKEN_KEY = 'token';

// Helper functions for localStorage
function saveAuthData(user: AuthResponse['user'] | null, token: string | null) {
  if (typeof window !== 'undefined') {
    if (user && token) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
  }
}

function getUserFromLocalStorage(): AuthResponse['user'] | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

function getTokenFromLocalStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  }
  return null;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user - try localStorage first, then API
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // First check localStorage
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        return localUser;
      }
      // If not in localStorage, fetch from API
      return getCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: typeof window !== 'undefined' ? getUserFromLocalStorage() : undefined,
  });

  // Sync user data to localStorage whenever it changes
  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (user && token) {
      saveAuthData(user, token);
    } else if (!user) {
      saveAuthData(null, null);
    }
  }, [user]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Save both user data and token to localStorage
      saveAuthData(data.user, data.token || null);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      router.push('/case-feed');
    },
    onError: (error: AuthError) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => registerApi(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Save both user data and token to localStorage
      saveAuthData(data.user, data.token || null);
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully. Please wait for license verification.',
      });
      router.push('/dashboard');
    },
    onError: (error: AuthError) => {
      const errorMessage = error.errors 
        ? Object.values(error.errors).flat().join(', ')
        : error.message || 'Registration failed. Please try again.';
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      saveAuthData(null, null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    },
    onError: (error: Error) => {
      // Even if logout fails, clear local state
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      saveAuthData(null, null);
      router.push('/');
      toast({
        title: 'Logged out',
        description: 'You have been logged out.',
      });
    },
  });

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    token: typeof window !== 'undefined' ? getTokenFromLocalStorage() : null,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}

