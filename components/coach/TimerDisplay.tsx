'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BuddhaQuote {
  quote: string;
  author?: string | null;
}

interface TimerDisplayProps {
  durationMinutes: number;
  activityName: string;
  onComplete: () => void;
  onExit: (actualDurationMinutes: number, shouldSave: boolean) => void;
}

export function TimerDisplay({
  durationMinutes,
  activityName,
  onComplete,
  onExit,
}: TimerDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60); // in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [quote, setQuote] = useState<BuddhaQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const startTimeRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (isCompleted || isPaused) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCompleted, isPaused]);

  // Fetch Buddhist quote on mount - only once per timer session
  useEffect(() => {
    let isCancelled = false;

    // Cancel any previous in-flight request before starting new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    async function fetchQuote() {
      try {
        setQuoteLoading(true);
        // Add timestamp to ensure fresh fetch (additional cache-busting)
        const response = await fetch(`/api/buddha-quote?t=${Date.now()}`, {
          signal: abortController.signal,
        });

        // Check if request was cancelled or component unmounted
        if (abortController.signal.aborted || isCancelled || !isMountedRef.current) {
          return;
        }

        if (response.ok) {
          const data: BuddhaQuote = await response.json();
          // Only update if component is still mounted, request wasn't aborted, and this is still the active request
          if (!abortController.signal.aborted && !isCancelled && isMountedRef.current && abortControllerRef.current === abortController) {
            setQuote(data);
            setQuoteLoading(false);
          }
        } else {
          if (!abortController.signal.aborted && !isCancelled && isMountedRef.current && abortControllerRef.current === abortController) {
            setQuoteLoading(false);
          }
        }
        // Fail silently if API fails - component handles gracefully
      } catch (error) {
        // Ignore abort errors (they're expected when cancelling requests)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching Buddhist quote:', error);
        // Fail silently - timer functionality is not affected
        if (!abortController.signal.aborted && !isCancelled && isMountedRef.current && abortControllerRef.current === abortController) {
          setQuoteLoading(false);
        }
      }
    }

    fetchQuote();

    // Cleanup: abort request and mark component as unmounted
    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      abortController.abort();
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Call onComplete after a brief delay to show the completion state
      const timeout = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCompleted, onComplete]);

  const handleExitClick = () => {
    // Pause timer while showing confirmation
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPaused(true);
    setShowExitConfirm(true);
  };

  const handleConfirmExit = (shouldSave: boolean) => {
    const actualDurationSeconds = Math.floor(
      (new Date().getTime() - startTimeRef.current.getTime()) / 1000
    );
    const actualDurationMinutes = Math.max(1, Math.ceil(actualDurationSeconds / 60));
    setShowExitConfirm(false);
    onExit(actualDurationMinutes, shouldSave);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setIsPaused(false);
    // Timer will resume automatically due to useEffect watching isPaused
    // The interval will restart when isPaused becomes false
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((durationMinutes * 60 - timeRemaining) / (durationMinutes * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      className="w-full max-w-lg"
    >
      <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm p-8 md:p-12 text-center space-y-8 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary/20">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        <CardHeader className="space-y-4 pb-6 p-0">
          <div className="space-y-4">
            <p className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">
              {isCompleted ? 'Session Complete' : 'Your Practice'}
            </p>
            <CardTitle className="text-3xl md:text-4xl font-serif font-normal text-foreground">
              {activityName}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-0">
          {/* Buddhist Quote */}
          <div className="px-2 py-4 min-h-[120px] md:min-h-[140px]">
            {!quoteLoading && quote ? (
              <motion.div
                key={quote.quote} // Key helps with smooth transitions between quotes
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <blockquote className="text-center space-y-2">
                  <p className="text-base md:text-lg italic font-serif text-muted-foreground leading-relaxed">
                    &ldquo;{quote.quote}&rdquo;
                  </p>
                  {quote.author && (
                    <footer className="text-sm text-muted-foreground/70 mt-2">
                      — {quote.author}
                    </footer>
                  )}
                </blockquote>
              </motion.div>
            ) : (
              <div className="h-full" /> // Reserve space while loading
            )}
          </div>

          {/* Timer Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-8"
          >
            <div
              className={`text-7xl md:text-8xl font-serif font-normal ${
                isCompleted
                  ? 'text-primary'
                  : timeRemaining <= 60
                  ? 'text-destructive'
                  : 'text-foreground'
              } transition-colors duration-300`}
            >
              {formatTime(timeRemaining)}
            </div>
            {isCompleted && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-lg text-muted-foreground"
              >
                Great work! Your session is complete.
              </motion.p>
            )}
          </motion.div>

          {/* Exit Confirmation Dialog */}
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="pt-4"
            >
              <div className="px-3 py-4 md:px-4 md:py-6 rounded-xl bg-muted/30 border border-border/50 space-y-4 -mx-1 md:-mx-2">
                <p className="text-center text-base font-medium text-foreground">
                  Exit session early?
                </p>
                <p className="text-center text-sm text-muted-foreground px-2">
                  Do you want to save this session?
                </p>
                <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 justify-center items-stretch md:items-center">
                  <Button
                    onClick={() => handleConfirmExit(true)}
                    variant="default"
                    className="w-full md:flex-1 md:max-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground px-3 md:px-4"
                    size="lg"
                  >
                    Save and Exit
                  </Button>
                  <Button
                    onClick={() => handleConfirmExit(false)}
                    variant="outline"
                    className="w-full md:flex-1 md:max-w-[180px] border-border hover:bg-muted whitespace-nowrap px-3 md:px-4"
                    size="lg"
                  >
                    Exit Without Saving
                  </Button>
                  <Button
                    onClick={handleCancelExit}
                    variant="ghost"
                    className="w-full md:shrink-0 md:w-auto md:min-w-[75px] text-muted-foreground hover:text-foreground px-3 md:px-4"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Exit Button */}
          {!isCompleted && !showExitConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4"
            >
              <Button
                onClick={handleExitClick}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground transition-colors"
                size="lg"
              >
                <X className="h-4 w-4 mr-2" />
                Exit Session
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
