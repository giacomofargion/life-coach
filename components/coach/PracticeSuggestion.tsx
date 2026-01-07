'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { CoachSuggestion, Activity } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PracticeSuggestionProps {
  suggestion: CoachSuggestion;
  onAccept: () => Promise<void>;
  onRetry: () => void;
  isLoading?: boolean;
}

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const effortLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const priorityColors = {
  high: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
};

const effortColors = {
  high: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  medium: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800',
  low: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800',
};

export function PracticeSuggestion({
  suggestion,
  onAccept,
  onRetry,
  isLoading = false,
}: PracticeSuggestionProps) {
  const [error, setError] = useState<Error | null>(null);
  const hasActivities = suggestion.mainActivity !== null;

  // Wrapper function to handle async onAccept and catch any errors
  const handleAccept = async () => {
    try {
      setError(null);
      await onAccept();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to accept suggestion');
      console.error('Error accepting practice suggestion:', error);
      setError(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      className="w-full max-w-lg"
    >
      <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm p-8 md:p-12 text-center space-y-8 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

        <CardHeader className="space-y-4 pb-6 p-0">
          {/* Icon Circle */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-2"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Sparkles className="h-10 w-10" />
            </div>
          </motion.div>
          <div className="space-y-4">
            <p className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">
              YOUR PRACTICE
            </p>
            <CardTitle className="text-3xl md:text-4xl font-serif font-normal text-foreground">
              {suggestion.mainActivity?.name || 'Rest'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          {/* Quote */}
          {suggestion.quote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 rounded-lg bg-muted/40"
            >
              <p className="text-lg text-foreground leading-relaxed">&ldquo;{suggestion.quote}&rdquo;</p>
            </motion.div>
          )}

          {/* Activity Badges */}
          {suggestion.mainActivity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[suggestion.mainActivity.priority]}`}
                >
                  {priorityLabels[suggestion.mainActivity.priority]} Priority
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${effortColors[suggestion.mainActivity.effort_level]}`}
                >
                  {effortLabels[suggestion.mainActivity.effort_level]} Effort
                </span>
              </div>
            </motion.div>
          )}

          {!hasActivities && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-4 rounded-lg bg-muted/30 text-center"
            >
              <p className="text-muted-foreground">
                No activities match your current energy level. Consider taking some rest or creating activities that require less effort.
              </p>
            </motion.div>
          )}

          {/* Reflection Prompt */}
          {suggestion.reflectionPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-4 rounded-lg bg-muted/30"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{suggestion.reflectionPrompt}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-3 pt-4"
          >
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive"
              >
                {error.message || 'Failed to save session. Please try again.'}
              </div>
            )}
            {hasActivities && (
              <Button
                onClick={handleAccept}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-14 text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Saving...' : "I'm doing this"}
              </Button>
            )}
            <button
              onClick={() => {
                setError(null);
                onRetry();
              }}
              disabled={isLoading}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
            >
              Choose differently
            </button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
