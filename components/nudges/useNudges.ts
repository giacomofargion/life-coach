'use client';

import { useNudgeContext } from './NudgeContext';

/**
 * Hook to access nudge data from context.
 * Must be used within a NudgeProvider.
 */
export function useNudges() {
  const { nudges, isLoading, refetch } = useNudgeContext();
  return { nudges, isLoading, refetch };
}
