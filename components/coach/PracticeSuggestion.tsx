'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CoachSuggestion } from '@/lib/types';
import {
  Card,
  CardContent,
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

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-4"
          >
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive mb-3"
              >
                {error.message || 'Failed to save session. Please try again.'}
              </div>
            )}
            {hasActivities && (
              <div className="mb-10">
                <Button
                  onClick={handleAccept}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-14 text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Saving...' : "I'm doing this"}
                </Button>
              </div>
            )}
            <button
              onClick={() => {
                setError(null);
                onRetry();
              }}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
            >
              Choose differently
            </button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
