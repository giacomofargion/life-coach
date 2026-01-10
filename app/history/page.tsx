'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from '@/lib/types';
import { WeeklyCalendar } from '@/components/history/WeeklyCalendar';
import { WeeklyReview } from '@/components/history/WeeklyReview';
import { NavHeader } from '@/components/navigation/NavHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  // Calculate current week start (Sunday)
  const currentWeekStart = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day; // Get Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(diff);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSessions();
    }
  }, [status]);

  async function fetchSessions() {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load session history');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading session history...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <NavHeader
              title="Session History"
              subtitle="View your past coaching sessions"
            />
            {sessions.length > 0 && (
              <Button
                onClick={() => setShowWeeklyReview(true)}
                className="w-full sm:w-auto"
              >
                Weekly Review
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6 text-lg">
              No sessions yet. Start your first coaching session to see your history here.
            </p>
            <Link href="/">
              <Button>Start a Session</Button>
            </Link>
          </div>
        ) : (
          <WeeklyCalendar sessions={sessions} />
        )}
      </div>

      <AnimatePresence>
        {showWeeklyReview && (
          <WeeklyReview
            sessions={sessions}
            weekStart={currentWeekStart}
            onClose={() => setShowWeeklyReview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
