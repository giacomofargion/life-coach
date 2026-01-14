'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Nudge } from '@/lib/types';

interface NudgeContextValue {
  nudges: Nudge[];
  activeCount: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const NudgeContext = createContext<NudgeContextValue | null>(null);

interface NudgeProviderProps {
  children: ReactNode;
}

export function NudgeProvider({ children }: NudgeProviderProps) {
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
  }, [fetchNudges]);

  // Calculate active count from nudges
  const activeCount = nudges.filter(n => !n.is_completed).length;

  return (
    <NudgeContext.Provider value={{ nudges, activeCount, isLoading, refetch: fetchNudges }}>
      {children}
    </NudgeContext.Provider>
  );
}

export function useNudgeContext() {
  const context = useContext(NudgeContext);
  if (!context) {
    throw new Error('useNudgeContext must be used within a NudgeProvider');
  }
  return context;
}
