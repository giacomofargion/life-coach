'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Session } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

const sessionTypeLabels = {
  morning: 'Morning',
  afternoon: 'Afternoon',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const priorityColors = {
  low: 'bg-violet-50 text-black border border-violet-200 dark:bg-violet-950/30 dark:text-black dark:border-violet-800',
  medium: 'bg-sky-50 text-black border border-sky-200 dark:bg-sky-950/30 dark:text-black dark:border-sky-800',
  high: 'bg-emerald-50 text-black border border-emerald-200 dark:bg-emerald-950/30 dark:text-black dark:border-emerald-800',
};

const sessionTypeOrder = {
  morning: 0,
  afternoon: 1,
} as const;

// Comparator function to sort sessions by type (morning first) then by time (earlier first)
function sortSessions(a: Session, b: Session): number {
  // First, sort by session_type (morning = 0, afternoon = 1)
  const typeDiff = sessionTypeOrder[a.session_type] - sessionTypeOrder[b.session_type];
  if (typeDiff !== 0) return typeDiff;

  // If same type, sort by time (earlier first)
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

// Helper function to format date as YYYY-MM-DD using local time
function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface WeeklyCalendarProps {
  sessions: Session[];
}

export function WeeklyCalendar({ sessions }: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day; // Get Sunday of current week
    const sunday = new Date(today.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach((session) => {
      const date = new Date(session.created_at);
      // Use local date for consistent display
      const dateKey = formatLocalDateKey(date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    return grouped;
  }, [sessions]);

  function goToPreviousWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  function goToNextWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  function goToCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const sunday = new Date(today.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(sunday);
  }

  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const thisSunday = new Date(today.setDate(diff));
    thisSunday.setHours(0, 0, 0, 0);
    return currentWeekStart.getTime() === thisSunday.getTime();
  }, [currentWeekStart]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weekRange = useMemo(() => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const year = start.getFullYear();

    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    } else {
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
    }
  }, [weekDays]);

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            aria-label="Next week"
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold px-2 sm:px-4 truncate min-w-0 flex-1">
            {weekRange}
          </h2>
        </div>
        {!isCurrentWeek && (
          <Button
            variant="outline"
            onClick={goToCurrentWeek}
            className="w-full sm:w-auto flex-shrink-0"
          >
            Go to Current Week
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Day Headers - hidden on mobile, shown on lg and above */}
        {dayNames.map((dayName, index) => (
          <div
            key={dayName}
            className="hidden lg:block text-center text-base font-medium text-muted-foreground pb-2"
          >
            {dayName}
          </div>
        ))}

        {/* Calendar Days */}
        {weekDays.map((date, index) => {
          // Use local date for consistent display
          const dateKey = formatLocalDateKey(date);
          const daySessions = sessionsByDate[dateKey] || [];
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] border-2 shadow-gentle transition-shadow hover:shadow-md overflow-hidden ${
                  isToday
                    ? 'border-primary bg-primary/5 shadow-md'
                    : ''
                }`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div
                      className={`text-lg sm:text-xl font-semibold ${
                        isToday ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    {/* Show day name on mobile only */}
                    <div className="text-sm font-medium text-muted-foreground lg:hidden">
                      {dayNames[date.getDay()]}
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-2.5">
                    {[...daySessions]
                      .sort(sortSessions)
                      .map((session) => {
                      const sessionDate = new Date(session.created_at);
                      const time = sessionDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                      const formatDuration = (minutes: number | null | undefined): string => {
                        if (!minutes || minutes === 0) return '';
                        if (minutes < 60) return `${minutes} min`;
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        if (mins === 0) return `${hours} hr`;
                        return `${hours} hr ${mins} min`;
                      };

                      const priority = session.mainActivity?.priority;

                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm p-2.5 sm:p-3 rounded-lg border-2 bg-card shadow-sm overflow-hidden"
                        >
                          <div className="font-medium truncate text-sm sm:text-base">
                            {sessionTypeLabels[session.session_type]}
                          </div>
                          <div className="text-muted-foreground text-xs sm:text-sm mt-1 break-words">
                            {time}
                            {session.duration_minutes && (
                              <span className="ml-1">• {formatDuration(session.duration_minutes)}</span>
                            )}
                          </div>
                          {session.mainActivity && (
                            <div className="mt-2 text-xs sm:text-sm font-medium truncate">
                              {session.mainActivity.name}
                            </div>
                          )}
                          {priority && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm font-medium mt-2 ${priorityColors[priority]}`}
                            >
                              {priorityLabels[priority]}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
