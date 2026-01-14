'use client';

import { useState, useCallback } from 'react';

interface FormSubmitState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface UseFormSubmitReturn extends FormSubmitState {
  execute: <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void | Promise<void>;
      successMessage?: string;
    }
  ) => Promise<T | undefined>;
  reset: () => void;
  setError: (error: string | null) => void;
}

/**
 * Custom hook to handle async form submissions with loading, error, and success states.
 * Eliminates repetitive state management across forms.
 */
export function useFormSubmit(): UseFormSubmitReturn {
  const [state, setState] = useState<FormSubmitState>({
    isLoading: false,
    error: null,
    success: null,
  });

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: null });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }));
  }, []);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void | Promise<void>;
      successMessage?: string;
    }
  ): Promise<T | undefined> => {
    setState({ isLoading: true, error: null, success: null });

    try {
      const result = await asyncFn();

      if (options?.onSuccess) {
        await options.onSuccess(result);
      }

      setState({
        isLoading: false,
        error: null,
        success: options?.successMessage || null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.';

      setState({
        isLoading: false,
        error: errorMessage,
        success: null,
      });

      return undefined;
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    setError,
  };
}
