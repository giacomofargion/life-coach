'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useNudgeCount() {
  const { data: session, status } = useSession();
  const [activeCount, setActiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchCount() {
    if (status !== 'authenticated' || !session) {
      setActiveCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/nudges');
      if (response.ok) {
        const data = await response.json();
        setActiveCount(data.activeCount || 0);
      }
    } catch (error) {
      console.error('Error fetching nudge count:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCount();

    // Listen for custom event when a nudge is created
    const handleNudgeCreated = () => {
      fetchCount();
    };

    window.addEventListener('nudgeCreated', handleNudgeCreated);

    return () => {
      window.removeEventListener('nudgeCreated', handleNudgeCreated);
    };
  }, [status, session]);

  return { activeCount, isLoading, refetch: fetchCount };
}
