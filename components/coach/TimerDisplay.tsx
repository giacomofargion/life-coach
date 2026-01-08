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

interface TimerDisplayProps {
  durationMinutes: number;
  activityName: string;
  onComplete: () => void;
  onExit: (actualDurationMinutes: number) => void;
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
  const startTimeRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleExit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const actualDurationSeconds = Math.floor(
      (new Date().getTime() - startTimeRef.current.getTime()) / 1000
    );
    const actualDurationMinutes = Math.max(1, Math.ceil(actualDurationSeconds / 60));
    onExit(actualDurationMinutes);
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

          {/* Exit Button */}
          {!isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4"
            >
              <Button
                onClick={handleExit}
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
