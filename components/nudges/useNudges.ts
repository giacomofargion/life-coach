'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Nudge } from '@/lib/types';

export function useNudges() {
  const { data: session, status } = useSession();
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNudges = useCallback(async () => {
    if (status !== 'authenticated' || !session) {
      setNudges([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/nudges');
      if (response.ok) {
        const data = await response.json();
        setNudges(data.nudges || []);
      }
    } catch (error) {
      console.error('Error fetching nudges:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    fetchNudges();

    // Listen for custom events when nudges change
    const handleNudgeChange = () => {
      fetchNudges();
    };

    window.addEventListener('nudgeCreated', handleNudgeChange);
    window.addEventListener('nudgeCompleted', handleNudgeChange);
    window.addEventListener('nudgeDeleted', handleNudgeChange);

    return () => {
      window.removeEventListener('nudgeCreated', handleNudgeChange);
      window.removeEventListener('nudgeCompleted', handleNudgeChange);
      window.removeEventListener('nudgeDeleted', handleNudgeChange);
    };
  }, [fetchNudges]);

  return { nudges, isLoading, refetch: fetchNudges };
}
