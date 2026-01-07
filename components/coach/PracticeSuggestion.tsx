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
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
    >
      <Card className="border shadow-soft bg-card/95">
        <CardHeader className="space-y-4 pb-6">
          {/* Icon Circle */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              YOUR PRACTICE
            </p>
            <CardTitle className="text-3xl md:text-4xl font-serif font-normal text-foreground">
              {suggestion.mainActivity?.name || 'Rest'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quote */}
          {suggestion.quote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 rounded-lg bg-muted/40"
            >
              <p className="text-base text-foreground leading-relaxed">"{suggestion.quote}"</p>
            </motion.div>
          )}

          {/* Activity Description */}
          {suggestion.mainActivity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-base text-foreground leading-relaxed">
                {suggestion.mainActivity.name}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
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
            {hasActivities && (
              <Button
                onClick={handleAccept}
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Saving...' : "I'm doing this."}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onRetry}
              disabled={isLoading}
              className="w-full underline-offset-4 hover:underline"
            >
              Choose differently.
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
