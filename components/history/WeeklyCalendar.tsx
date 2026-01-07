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

const energyLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const energyColors = {
  low: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  high: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

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
      const dateKey = date.toISOString().split('T')[0];
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

  const weekRange = useMemo(() => {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold px-4 min-w-[300px]">{weekRange}</h2>
        </div>
        {!isCurrentWeek && (
          <Button variant="outline" onClick={goToCurrentWeek}>
            Go to Current Week
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {dayNames.map((dayName, index) => (
          <div
            key={dayName}
            className="text-center text-sm font-medium text-muted-foreground pb-2"
          >
            {dayName}
          </div>
        ))}

        {/* Calendar Days */}
        {weekDays.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
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
                className={`min-h-[150px] ${
                  isToday
                    ? 'border-primary border-2 bg-primary/5'
                    : ''
                }`}
              >
                <CardContent className="p-3">
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1.5">
                    {daySessions.map((session) => {
                      const sessionDate = new Date(session.created_at);
                      const time = sessionDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs p-1.5 rounded border bg-card"
                        >
                          <div className="font-medium truncate">
                            {sessionTypeLabels[session.session_type]}
                          </div>
                          <div className="text-muted-foreground text-[10px]">
                            {time}
                          </div>
                          {session.mainActivity && (
                            <div className="mt-1 text-[10px] font-medium truncate">
                              {session.mainActivity.name}
                            </div>
                          )}
                          {session.fillerActivity && (
                            <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                              + {session.fillerActivity.name}
                            </div>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium mt-1 ${energyColors[session.energy_level]}`}
                          >
                            {energyLabels[session.energy_level]}
                          </span>
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
