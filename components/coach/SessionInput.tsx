'use client';

import { useState } from 'react';
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Start Your Session</CardTitle>
        <CardDescription>
          Let's find the right practice for you right now
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="session_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When is this session?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="morning" id="morning" />
                        <label
                          htmlFor="morning"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Morning
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="afternoon" id="afternoon" />
                        <label
                          htmlFor="afternoon"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Afternoon
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
                  <FormLabel>How is your energy level?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <label
                          htmlFor="low"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Low
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <label
                          htmlFor="medium"
                          className="text-sm font-medium leading-none peer-disabled:opacity-70 cursor-pointer"
                        >
                          Medium
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <label
                          htmlFor="high"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          High
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Getting suggestion...' : 'Get Practice Suggestion'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
