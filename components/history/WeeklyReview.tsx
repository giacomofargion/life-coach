'use client';

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { Session, Activity, Priority } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeeklyReviewProps {
  sessions: Session[];
  weekStart: Date; // Sunday of the current week
  onClose: () => void;
}

interface ActivityStats {
  activity: Activity;
  totalMinutes: number;
  sessionCount: number;
}

interface PriorityStats {
  high: number;
  medium: number;
  low: number;
  total: number;
}

// Helper function to check if a date is within the current calendar week
function isInWeek(date: Date, weekStart: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
}

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

const priorityColors = {
  high: 'bg-emerald-50 text-black border border-emerald-200 dark:bg-emerald-950/30 dark:text-black dark:border-emerald-800',
  medium: 'bg-sky-50 text-black border border-sky-200 dark:bg-sky-950/30 dark:text-black dark:border-sky-800',
  low: 'bg-violet-50 text-black border border-violet-200 dark:bg-violet-950/30 dark:text-black dark:border-violet-800',
};

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function WeeklyReview({ sessions, weekStart, onClose }: WeeklyReviewProps) {
  // Lock body scroll when review is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup function to restore original overflow
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Filter sessions to current calendar week
  const weekSessions = useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.created_at);
      return isInWeek(sessionDate, weekStart);
    });
  }, [sessions, weekStart]);

  // Calculate activity statistics
  const activityStats = useMemo((): ActivityStats[] => {
    const activityMap = new Map<string, ActivityStats>();

    weekSessions.forEach((session) => {
      if (!session.mainActivity || !session.duration_minutes) return;

      const activityId = session.mainActivity.id;
      const existing = activityMap.get(activityId);

      if (existing) {
        existing.totalMinutes += session.duration_minutes;
        existing.sessionCount += 1;
      } else {
        activityMap.set(activityId, {
          activity: session.mainActivity,
          totalMinutes: session.duration_minutes,
          sessionCount: 1,
        });
      }
    });

    return Array.from(activityMap.values())
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 5); // Top 5 most worked on
  }, [weekSessions]);

  // Calculate priority breakdown
  const priorityStats = useMemo((): PriorityStats => {
    const stats: PriorityStats = {
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    weekSessions.forEach((session) => {
      if (!session.mainActivity || !session.duration_minutes) return;

      const priority = session.mainActivity.priority;
      const minutes = session.duration_minutes;

      stats[priority] += minutes;
      stats.total += minutes;
    });

    return stats;
  }, [weekSessions]);

  // Calculate priority percentage
  const highPriorityPercentage = useMemo(() => {
    if (priorityStats.total === 0) return 0;
    return Math.round((priorityStats.high / priorityStats.total) * 100);
  }, [priorityStats]);

  // Generate coach message with warm, Buddhist-inspired tone
  const coachMessage = useMemo(() => {
    if (priorityStats.total === 0) {
      return {
        title: 'A Fresh Beginning',
        message: 'This week is a blank page, full of possibility. Each moment is an opportunity to return to your practice with fresh eyes and an open heart. What would you like to cultivate this week?',
      };
    }

    if (highPriorityPercentage >= 60) {
      return {
        title: 'Tending to What Matters',
        message: `Your practice this week has been deeply aligned with what matters most—${highPriorityPercentage}% of your time has been given to high-priority tasks. This is the work of a mindful practitioner, tending to what truly nourishes your path. ` +
        `Take a moment to appreciate this dedication. Perhaps this is a good time to rest and let your efforts settle, like allowing the soil to absorb the rain before planting again. ` +
        `Balance is the key—sometimes the most compassionate act is to pause and let yourself be held by stillness.`,
      };
    } else {
      const hasOtherPriorities = priorityStats.medium > 0 || priorityStats.low > 0;

      let message = `This week, you've given ${formatDuration(priorityStats.high)} to high-priority tasks (${highPriorityPercentage}% of your time). `;

      if (hasOtherPriorities) {
        message += `There's a beautiful balance here—you've also honored activities that bring you joy and nourishment. ` +
        `In the practice of mindful living, we're invited to hold both: tending to what needs attention while also allowing space for what brings ease and delight. ` +
        `As you move forward, you might gently notice where a bit more time on high-priority tasks could serve your deepest intentions, without losing the wisdom of rest and play. ` +
        `All of it—the focused work and the moments of ease—are part of the path.`;
      } else {
        message += `Every journey begins with awareness. Perhaps this week you might gently explore giving a bit more attention to high-priority tasks when your energy feels ready. ` +
        `Not from a place of urgency or "should," but from a place of care—like tending a garden, we nurture what needs our attention with patience and presence.`;
      }

      return {
        title: 'A Gentle Reflection',
        message,
      };
    }
  }, [highPriorityPercentage, priorityStats]);

  const hasSessions = weekSessions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
          <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm p-8 md:p-12 text-center space-y-8 rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors z-10"
              aria-label="Close review"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <CardHeader className="space-y-4 pb-6 p-0 relative">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="flex justify-center mb-2"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <TrendingUp className="h-10 w-10" />
                </div>
              </motion.div>
              <div className="space-y-4">
                <p className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">
                  WEEKLY REVIEW
                </p>
                <CardTitle className="text-3xl md:text-4xl font-serif font-normal text-foreground">
                  This Week&apos;s Summary
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-0 text-left">
              {!hasSessions ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="p-4 rounded-lg bg-muted/30 text-center"
                >
                  <p className="text-muted-foreground">
                    This week is just beginning. Each moment is a fresh opportunity to return to your practice with presence and care.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Activity Summary */}
                  {activityStats.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Most Worked On Tasks
                      </h3>
                      <div className="space-y-2">
                        {activityStats.map((stat, index) => (
                          <motion.div
                            key={stat.activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-lg bg-card border-2 border-border hover:border-primary/20 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {stat.activity.name}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {stat.sessionCount} {stat.sessionCount === 1 ? 'session' : 'sessions'}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${priorityColors[stat.activity.priority]}`}>
                                {priorityLabels[stat.activity.priority]}
                              </span>
                              <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                                {formatDuration(stat.totalMinutes)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Priority Breakdown */}
                  {priorityStats.total > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Priority Breakdown
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {(['high', 'medium', 'low'] as Priority[]).map((priority) => {
                          const minutes = priorityStats[priority];
                          const percentage = priorityStats.total > 0
                            ? Math.round((minutes / priorityStats.total) * 100)
                            : 0;

                          return (
                            <motion.div
                              key={priority}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="p-4 rounded-lg bg-card border-2 border-border text-center"
                            >
                              <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium mb-2 ${priorityColors[priority]}`}>
                                {priorityLabels[priority]}
                              </div>
                              <div className="text-2xl font-semibold text-foreground">
                                {percentage}%
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {formatDuration(minutes)}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Coach Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="p-6 rounded-lg bg-primary/5 border border-primary/20 space-y-3"
                  >
                    <h3 className="text-lg font-semibold text-foreground">
                      {coachMessage.title}
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {coachMessage.message}
                    </p>
                  </motion.div>
                </>
              )}

              {/* Close Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="pt-4"
              >
                <Button
                  onClick={onClose}
                  className="w-full rounded-xl h-12 text-base font-medium"
                  variant="outline"
                >
                  Close
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
  );
}
