'use client';

import { useState } from 'react';
import { queryAI, AIQueryRequest, AIQueryResponse } from '@/lib/api/ai';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const search = async (request: AIQueryRequest) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await queryAI(request);
      
      if (response.success && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        return response;
      } else {
        const errorMsg = 'No suggestions available. Please try rephrasing your query.';
        setError(errorMsg);
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to get AI suggestions. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setError(null);
    setSuggestions([]);
  };

  return {
    search,
    clear,
    isLoading,
    error,
    suggestions,
  };
}

