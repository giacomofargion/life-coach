'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Activity, Priority, EffortLevel } from '@/lib/types';

const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  priority: z.enum(['high', 'medium', 'low']),
  effort_level: z.enum(['high', 'medium', 'low']),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  activity?: Activity;
  onSubmit: (data: ActivityFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ActivityForm({
  activity,
  onSubmit,
  onCancel,
  isLoading = false,
}: ActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: activity?.name || '',
      priority: activity?.priority || 'medium',
      effort_level: activity?.effort_level || 'medium',
    },
  });

  useEffect(() => {
    if (activity) {
      form.reset({
        name: activity.name,
        priority: activity.priority,
        effort_level: activity.effort_level,
      });
    }
  }, [activity, form]);

  async function handleSubmit(values: ActivityFormValues) {
    await onSubmit(values);
    if (!activity) {
      form.reset();
    }
  }

  return (
    <Card className="w-full max-w-md border shadow-soft bg-card/95">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-3xl font-serif font-normal">
          {activity ? 'Edit Activity' : 'Create Activity'}
        </CardTitle>
        <CardDescription className="text-base">
          {activity
            ? 'Update your activity details'
            : 'Add a new activity to your coaching practice'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Morning meditation"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effort_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effort Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select effort level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? activity
                    ? 'Updating...'
                    : 'Creating...'
                  : activity
                  ? 'Update Activity'
                  : 'Create Activity'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
