'use client';

import { useState } from 'react';
import { Sun, Moon, Battery, BatteryLow, Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SessionType, EnergyLevel } from '@/lib/types';

const sessionSchema = z.object({
  session_type: z.enum(['morning', 'afternoon']),
  energy_level: z.enum(['low', 'medium', 'high']),
});

type SessionInputValues = z.infer<typeof sessionSchema>;

interface SessionInputProps {
  onSubmit: (data: SessionInputValues) => Promise<void>;
  isLoading?: boolean;
}

export function SessionInput({ onSubmit, isLoading = false }: SessionInputProps) {
  const form = useForm<SessionInputValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      session_type: 'morning',
      energy_level: 'medium',
    },
  });

  async function handleSubmit(values: SessionInputValues) {
    await onSubmit(values);
  }

  return (
    <Card className="w-full max-w-lg border shadow-soft bg-card/95">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-3xl md:text-4xl font-serif font-normal text-foreground">
          How is your energy?
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Be honest. There is no wrong answer. I will meet you where you are.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="session_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">When is this session?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-3"
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                        <RadioGroupItem value="morning" id="morning" />
                        <label
                          htmlFor="morning"
                          className="text-base font-medium leading-none cursor-pointer flex items-center gap-3 flex-1"
                        >
                          <Sun className="h-5 w-5 text-amber-500" />
                          <span>Morning</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                        <RadioGroupItem value="afternoon" id="afternoon" />
                        <label
                          htmlFor="afternoon"
                          className="text-base font-medium leading-none cursor-pointer flex items-center gap-3 flex-1"
                        >
                          <Moon className="h-5 w-5 text-indigo-500" />
                          <span>Afternoon</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="energy_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">How is your energy level?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-3"
                      disabled={isLoading}
                    >
                      <div className="flex items-start space-x-3 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                        <RadioGroupItem value="low" id="low" className="mt-1" />
                        <label
                          htmlFor="low"
                          className="text-base font-medium leading-tight cursor-pointer flex flex-col gap-1 flex-1"
                        >
                          <span>Low</span>
                          <span className="text-sm font-normal text-muted-foreground">I need rest & grounding</span>
                        </label>
                      </div>
                      <div className="flex items-start space-x-3 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                        <RadioGroupItem value="medium" id="medium" className="mt-1" />
                        <label
                          htmlFor="medium"
                          className="text-base font-medium leading-tight cursor-pointer flex flex-col gap-1 flex-1"
                        >
                          <span>Steady</span>
                          <span className="text-sm font-normal text-muted-foreground">I have some capacity</span>
                        </label>
                      </div>
                      <div className="flex items-start space-x-3 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors cursor-pointer">
                        <RadioGroupItem value="high" id="high" className="mt-1" />
                        <label
                          htmlFor="high"
                          className="text-base font-medium leading-tight cursor-pointer flex flex-col gap-1 flex-1"
                        >
                          <span>High</span>
                          <span className="text-sm font-normal text-muted-foreground">I'm ready to move</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-8" disabled={isLoading} size="lg">
              {isLoading ? 'Getting suggestion...' : 'Continue'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
