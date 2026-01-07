'use client';

import { motion } from 'framer-motion';
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
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const effortColors = {
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  low: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
};

function ActivityCard({ activity, label }: { activity: Activity; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 rounded-lg border bg-card"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium">{label}</h4>
      </div>
      <h3 className="text-xl font-semibold mb-3">{activity.name}</h3>
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[activity.priority]}`}
        >
          Priority: {priorityLabels[activity.priority]}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${effortColors[activity.effort_level]}`}
        >
          Effort: {effortLabels[activity.effort_level]}
        </span>
      </div>
    </motion.div>
  );
}

export function PracticeSuggestion({
  suggestion,
  onAccept,
  onRetry,
  isLoading = false,
}: PracticeSuggestionProps) {
  const hasActivities = suggestion.mainActivity !== null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Practice Suggestion</CardTitle>
          <CardDescription>Here's what feels right for you now</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary"
          >
            <p className="text-lg italic text-foreground">"{suggestion.quote}"</p>
          </motion.div>

          {/* Activities */}
          {hasActivities ? (
            <div className="space-y-4">
              {suggestion.mainActivity && (
                <ActivityCard activity={suggestion.mainActivity} label="Main Practice" />
              )}
              {suggestion.fillerActivity && (
                <ActivityCard activity={suggestion.fillerActivity} label="Optional Practice" />
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-4 rounded-lg border text-center"
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
              className="p-4 rounded-lg bg-accent/50 border"
            >
              <h4 className="font-medium mb-2">Reflection</h4>
              <p className="text-sm text-muted-foreground">{suggestion.reflectionPrompt}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex gap-3"
          >
            {hasActivities && (
              <Button
                onClick={onAccept}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Accept & Start Session'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={isLoading}
              className={hasActivities ? 'flex-1' : 'w-full'}
            >
              Try Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
