'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ChevronLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { SessionType, EnergyLevel } from '@/lib/types';

interface SessionInputProps {
  onSubmit: (data: { session_type: SessionType; energy_level: EnergyLevel }) => Promise<void>;
  isLoading?: boolean;
}

export function SessionInput({ onSubmit, isLoading = false }: SessionInputProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);

  function handleSessionTypeSelect(value: SessionType) {
    setSessionType(value);
    // Automatically advance to step 2
    setTimeout(() => setStep(2), 150);
  }

  function handleEnergySelect(value: EnergyLevel) {
    setEnergyLevel(value);
  }

  async function handleSubmit() {
    if (sessionType && energyLevel) {
      await onSubmit({ session_type: sessionType, energy_level: energyLevel });
    }
  }

  function handleBack() {
    setStep(1);
  }

  return (
    <Card className="w-full max-w-lg border-none shadow-2xl bg-card/80 backdrop-blur-sm min-h-[420px] flex flex-col">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
            <CardHeader className="space-y-4 pt-10 pb-6 text-center">
              <CardTitle className="text-4xl md:text-5xl font-serif font-normal text-primary tracking-tight">
                When is this session?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-xs mx-auto">
                Let me know when you&apos;re practicing so I can tailor my suggestion.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <RadioGroup
                value={sessionType || ''}
                onValueChange={(value) => handleSessionTypeSelect(value as SessionType)}
                className="grid grid-cols-2 gap-4"
              >
                <SessionTimeButton
                  value="morning"
                  id="morning"
                  label="Morning"
                  icon={<Sun className="h-8 w-8 text-amber-500" />}
                  checked={sessionType === 'morning'}
                />
                <SessionTimeButton
                  value="afternoon"
                  id="afternoon"
                  label="Afternoon"
                  icon={<Moon className="h-8 w-8 text-indigo-500" />}
                  checked={sessionType === 'afternoon'}
                />
              </RadioGroup>
            </CardContent>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1 pt-5 pb-5"
          >
            <CardHeader className="space-y-4 pb-6 text-center relative">
              <button
                onClick={handleBack}
                className="absolute left-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <CardTitle className="text-4xl md:text-5xl font-serif font-normal text-primary tracking-tight">
                How is your energy?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-xs mx-auto">
                Be honest. There is no wrong answer. I will meet you where you are.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col">
              <RadioGroup
                value={energyLevel || ''}
                onValueChange={(value) => handleEnergySelect(value as EnergyLevel)}
                className="flex flex-col space-y-3"
              >
                <EnergyButton
                  value="low"
                  id="low"
                  label="Low"
                  desc="I need rest & grounding"
                  checked={energyLevel === 'low'}
                />
                <EnergyButton
                  value="medium"
                  id="medium"
                  label="Steady"
                  desc="I have some capacity"
                  checked={energyLevel === 'medium'}
                />
                <EnergyButton
                  value="high"
                  id="high"
                  label="High"
                  desc="I'm ready to move"
                  checked={energyLevel === 'high'}
                />
              </RadioGroup>
              <Button
                onClick={handleSubmit}
                className="w-full rounded-2xl h-14 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-auto"
                disabled={isLoading || !energyLevel}
                size="lg"
              >
                {isLoading ? 'Getting suggestion...' : 'Continue'}
              </Button>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function SessionTimeButton({
  value,
  id,
  label,
  icon,
  checked
}: {
  value: string;
  id: string;
  label: string;
  icon: React.ReactNode;
  checked: boolean;
}) {
  return (
    <motion.label
      htmlFor={id}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`group flex flex-col items-center justify-center p-8 bg-card hover:bg-accent border ${
        checked ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/20'
      } rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer`}
    >
      <RadioGroupItem value={value} id={id} className="sr-only" />
      <div className="mb-3">{icon}</div>
      <div className={`font-serif text-xl transition-colors ${
        checked ? 'text-primary' : 'text-foreground group-hover:text-primary'
      }`}>
        {label}
      </div>
    </motion.label>
  );
}

function EnergyButton({
  value,
  id,
  label,
  desc,
  checked
}: {
  value: string;
  id: string;
  label: string;
  desc: string;
  checked: boolean;
}) {
  return (
    <motion.label
      htmlFor={id}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group flex items-center justify-between px-5 py-4 bg-card hover:bg-accent border ${
        checked ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/20'
      } rounded-2xl shadow-sm hover:shadow-md transition-all text-left w-full cursor-pointer`}
    >
      <div className="flex items-center gap-3 flex-1">
        <RadioGroupItem value={value} id={id} className="sr-only" />
        <div className="flex flex-col">
          <div className={`font-serif text-lg transition-colors ${
            checked ? 'text-primary' : 'text-foreground group-hover:text-primary'
          }`}>
            {label}
          </div>
          <div className="text-sm text-muted-foreground">
            {desc}
          </div>
        </div>
      </div>
      <div
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: checked ? "rgb(48, 54, 52)" : 'hsl(var(--muted-foreground) / 0.3)',
          backgroundColor: checked ? "rgb(48, 54, 52)" : 'transparent'
        }}
      >
      </div>
    </motion.label>
  );
}
