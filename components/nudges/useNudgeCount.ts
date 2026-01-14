'use client';

import { useNudgeContext } from './NudgeContext';

/**
 * Hook to access the active nudge count from context.
 * Must be used within a NudgeProvider.
 */
export function useNudgeCount() {
  const { activeCount, isLoading, refetch } = useNudgeContext();
  return { activeCount, isLoading, refetch };
}
