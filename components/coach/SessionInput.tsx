'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, ArrowRight } from 'lucide-react';
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
    <Card className="w-full max-w-lg border-none shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6 text-center">
        <CardTitle className="text-4xl md:text-5xl font-serif font-normal text-primary tracking-tight">
          How is your energy?
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground max-w-xs mx-auto">
          Be honest. There is no wrong answer. I will meet you where you are.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
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
                      <EnergyButton
                        value="morning"
                        id="morning"
                        label="Morning"
                        icon={<Sun className="h-5 w-5 text-amber-500" />}
                        checked={field.value === 'morning'}
                      />
                      <EnergyButton
                        value="afternoon"
                        id="afternoon"
                        label="Afternoon"
                        icon={<Moon className="h-5 w-5 text-indigo-500" />}
                        checked={field.value === 'afternoon'}
                      />
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
                      className="flex flex-col space-y-3 pt-4"
                      disabled={isLoading}
                    >
                      <EnergyButton
                        value="low"
                        id="low"
                        label="Low"
                        desc="I need rest & grounding"
                        checked={field.value === 'low'}
                      />
                      <EnergyButton
                        value="medium"
                        id="medium"
                        label="Steady"
                        desc="I have some capacity"
                        checked={field.value === 'medium'}
                      />
                      <EnergyButton
                        value="high"
                        id="high"
                        label="High"
                        desc="I'm ready to move"
                        checked={field.value === 'high'}
                      />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-8 rounded-2xl h-14 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Getting suggestion...' : 'Continue'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function EnergyButton({
  value,
  id,
  label,
  desc,
  icon,
  checked
}: {
  value: string;
  id: string;
  label: string;
  desc?: string;
  icon?: React.ReactNode;
  checked: boolean;
}) {
  return (
    <motion.label
      htmlFor={id}
      whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--accent))" }}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-center justify-between p-6 bg-card hover:bg-white/50 border ${
        checked ? 'border-primary/40 bg-primary/5' : 'border-transparent hover:border-primary/20'
      } rounded-2xl shadow-sm hover:shadow-md transition-all text-left w-full cursor-pointer`}
    >
      <div className="flex items-center gap-3 flex-1">
        <RadioGroupItem value={value} id={id} className={desc ? 'mt-1' : ''} />
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className={desc ? 'flex flex-col gap-1' : ''}>
          <div className={`font-serif text-xl transition-colors ${
            checked ? 'text-primary' : 'text-foreground group-hover:text-primary'
          }`}>
            {label}
          </div>
          {desc && (
            <div className="text-sm text-muted-foreground">
              {desc}
            </div>
          )}
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center transition-opacity ${
        checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <ArrowRight className="w-4 h-4 text-primary" />
      </div>
    </motion.label>
  );
}
