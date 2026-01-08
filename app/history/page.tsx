'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Settings } from 'lucide-react';
import { Session } from '@/lib/types';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { WeeklyCalendar } from '@/components/history/WeeklyCalendar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-foreground mb-3">
              Session History
            </h1>
            <p className="text-base text-muted-foreground">
              View your past coaching sessions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>New Session</span>
              </Button>
            </Link>
            <Link href="/activities">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                <span>Manage Activities</span>
              </Button>
            </Link>
            <LogoutButton />
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
    </div>
  );
}
