'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Settings, Calendar } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { SessionInput } from '@/components/coach/SessionInput';
import { PracticeSuggestion } from '@/components/coach/PracticeSuggestion';
import { CoachSuggestion, SessionType, EnergyLevel } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: session, status } = useSession();
  const [suggestion, setSuggestion] = useState<CoachSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  async function handleSessionSubmit(data: {
    session_type: SessionType;
    energy_level: EnergyLevel;
  }) {
    setLoading(true);
    setError(null);
    setSuggestion(null);
    setSessionType(data.session_type);
    setEnergyLevel(data.energy_level);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestion');
      }

      const result = await response.json();
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error('Error getting suggestion:', error);
      setError('Failed to get suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptSuggestion() {
    if (!suggestion || !sessionType || !energyLevel) {
      return;
    }

    setSavingSession(true);
    setError(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_type: sessionType,
          energy_level: energyLevel,
          main_activity_id: suggestion.mainActivity?.id,
          filler_activity_id: suggestion.fillerActivity?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      // Reset after successful save
      setSuggestion(null);
      setSessionType(null);
      setEnergyLevel(null);
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Failed to save session. Please try again.');
    } finally {
      setSavingSession(false);
    }
  }

  function handleRetry() {
    setSuggestion(null);
    setSessionType(null);
    setEnergyLevel(null);
    setError(null);
  }

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-8 bg-gradient-to-br from-[#f5f3f0] via-[#f8f6f3] to-[#f0f2f0]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3 font-normal">
            Life Coach App
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/activities">
            <Button variant="ghost" className="gap-2 text-foreground hover:bg-accent/50">
              <Settings className="h-4 w-4" />
              <span>Manage Activities</span>
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" className="gap-2 text-foreground hover:bg-accent/50">
              <Calendar className="h-4 w-4" />
              <span>Session History</span>
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="max-w-2xl mx-auto w-full">

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {!suggestion ? (
          <div className="flex justify-center">
            <SessionInput
              onSubmit={handleSessionSubmit}
              isLoading={loading}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <PracticeSuggestion
              suggestion={suggestion}
              onAccept={handleAcceptSuggestion}
              onRetry={handleRetry}
              isLoading={savingSession}
            />
          </div>
        )}
      </div>
    </main>
  );
}
