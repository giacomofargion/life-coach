'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SessionInput } from '@/components/coach/SessionInput';
import { PracticeSuggestion } from '@/components/coach/PracticeSuggestion';
import { TimerDisplay } from '@/components/coach/TimerDisplay';
import { CoachSuggestion, SessionType, EnergyLevel } from '@/lib/types';
import { NavHeader } from '@/components/navigation/NavHeader';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<CoachSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number | null>(null);

  // Restore sessionType from sessionStorage after login
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const storedSessionType = sessionStorage.getItem('pendingSessionType');
      if (storedSessionType && (storedSessionType === 'morning' || storedSessionType === 'afternoon')) {
        setSessionType(storedSessionType as SessionType);
        sessionStorage.removeItem('pendingSessionType');
      }
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Handle session type selection for unauthenticated users
  async function handleSessionTypeSelect(data: { session_type: SessionType; energy_level?: EnergyLevel }) {
    if (!session) {
      // Store selection and redirect to login
      sessionStorage.setItem('pendingSessionType', data.session_type);
      router.push('/login');
      return;
    }
    // If authenticated, this shouldn't be called (should use handleSessionSubmit instead)
  }

  async function handleSessionSubmit(data: {
    session_type: SessionType;
    energy_level?: EnergyLevel;
  }) {
    if (!data.energy_level) {
      return; // Should not happen for authenticated users
    }
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

  async function handleAcceptSuggestion(durationMinutes: number) {
    if (!suggestion || !sessionType || !energyLevel) {
      return;
    }

    // Start the timer instead of immediately saving
    setSelectedDurationMinutes(durationMinutes);
    setTimerStartTime(new Date());
    setIsTimerActive(true);
    setError(null);
  }

  async function handleTimerComplete() {
    if (!suggestion || !sessionType || !energyLevel || !timerStartTime || !selectedDurationMinutes) {
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
          duration_minutes: selectedDurationMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      // Reset after successful save
      setSuggestion(null);
      setSessionType(null);
      setEnergyLevel(null);
      setIsTimerActive(false);
      setTimerStartTime(null);
      setSelectedDurationMinutes(null);
    } catch (error) {
      console.error('Error saving session:', error);
      setError('Failed to save session. Please try again.');
    } finally {
      setSavingSession(false);
    }
  }

  async function handleTimerExit(actualDurationMinutes: number) {
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
          duration_minutes: actualDurationMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      // Reset after successful save
      setSuggestion(null);
      setSessionType(null);
      setEnergyLevel(null);
      setIsTimerActive(false);
      setTimerStartTime(null);
      setSelectedDurationMinutes(null);
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
    <main className="relative min-h-screen w-full overflow-hidden text-foreground selection:bg-primary/20">
      {/* Subtle Grain Texture Overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Header - positioned at top of page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 p-6 md:p-8"
      >
        {session && <NavHeader title="Life Coach App" />}
      </motion.div>

      <div className="relative z-10 flex flex-col items-center p-6 md:p-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive"
              >
                <span>{error}</span>
              </motion.div>
            )}

            {!suggestion ? (
              <motion.div
                key="session-input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex justify-center"
              >
                <SessionInput
                  onSubmit={session ? handleSessionSubmit : handleSessionTypeSelect}
                  isLoading={loading}
                  isAuthenticated={!!session}
                  initialSessionType={sessionType}
                />
              </motion.div>
            ) : isTimerActive && selectedDurationMinutes ? (
              <motion.div
                key="timer-display"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                className="flex justify-center"
              >
                <TimerDisplay
                  durationMinutes={selectedDurationMinutes}
                  activityName={suggestion.mainActivity?.name || 'Rest'}
                  onComplete={handleTimerComplete}
                  onExit={handleTimerExit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="practice-suggestion"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                className="flex justify-center"
              >
                <PracticeSuggestion
                  suggestion={suggestion}
                  onAccept={handleAcceptSuggestion}
                  onRetry={handleRetry}
                  isLoading={savingSession}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
