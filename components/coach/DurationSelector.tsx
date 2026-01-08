'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DurationSelectorProps {
  onDurationChange: (minutes: number) => void;
  initialHours?: number;
  initialMinutes?: number;
}

export function DurationSelector({
  onDurationChange,
  initialHours = 0,
  initialMinutes = 15,
}: DurationSelectorProps) {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  useEffect(() => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes >= 1) {
      onDurationChange(totalMinutes);
    }
  }, [hours, minutes, onDurationChange]);

  const incrementHours = () => {
    setHours((prev) => prev + 1);
  };

  const decrementHours = () => {
    setHours((prev) => Math.max(0, prev - 1));
  };

  const incrementMinutes = () => {
    setMinutes((prev) => {
      if (prev >= 59) {
        setHours((h) => h + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const decrementMinutes = () => {
    setMinutes((prev) => {
      if (prev <= 0) {
        if (hours > 0) {
          setHours((h) => h - 1);
          return 59;
        }
        return 0;
      }
      return prev - 1;
    });
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setHours(Math.max(0, value));
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 60) {
      setHours((h) => h + Math.floor(value / 60));
      setMinutes(value % 60);
    } else {
      setMinutes(Math.max(0, Math.min(59, value)));
    }
  };

  const totalMinutes = hours * 60 + minutes;
  const isValid = totalMinutes >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
          For how long?
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        {/* Hours */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Hours
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={decrementHours}
              disabled={hours === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="number"
              min="0"
              value={hours}
              onChange={handleHoursChange}
              className="w-16 h-10 text-center text-lg font-serif rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={incrementHours}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Separator */}
        <div className="text-2xl text-muted-foreground font-light">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Minutes
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={decrementMinutes}
              disabled={hours === 0 && minutes === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={handleMinutesChange}
              className="w-16 h-10 text-center text-lg font-serif rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={incrementMinutes}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {!isValid && (
        <p className="text-xs text-center text-muted-foreground">
          Please select at least 1 minute
        </p>
      )}
    </motion.div>
  );
}
