'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
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
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function ActivityForm({
  activity,
  onSubmit,
  onCancel,
  onDelete,
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="flex items-center gap-4 mb-8">
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-primary/5 text-muted-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-3xl font-serif text-primary">
          {activity ? 'Edit Practice' : 'Create Practice'}
        </h1>
      </div>

      <Card className="p-8 bg-card/50 backdrop-blur-sm border-none rounded-3xl space-y-8 shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                      Practice Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Morning meditation"
                        {...field}
                        disabled={isLoading}
                        className="bg-background/50 border-none h-14 text-xl font-serif rounded-2xl focus-visible:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="effort_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                        Effort Required
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                          className="flex gap-2"
                        >
                          {(['low', 'medium', 'high'] as EffortLevel[]).map((level) => {
                            const isSelected = field.value === level;
                            return (
                              <div key={level} className="flex-1">
                                <RadioGroupItem
                                  value={level}
                                  id={`effort-${level}`}
                                  className="sr-only"
                                />
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="rounded-xl"
                                >
                                  <Label
                                    htmlFor={`effort-${level}`}
                                    className={`flex items-center justify-center h-12 rounded-xl border cursor-pointer transition-all capitalize ${
                                      isSelected
                                        ? 'border-primary bg-primary text-primary-foreground font-medium shadow-sm'
                                        : 'border-primary/10 bg-background/30 hover:bg-accent hover:border-primary/20'
                                    }`}
                                  >
                                    {level}
                                  </Label>
                                </motion.div>
                              </div>
                            );
                          })}
                        </RadioGroup>
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
                      <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                        Priority
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                          className="flex gap-2"
                        >
                          {(['low', 'medium', 'high'] as Priority[]).map((level) => {
                            const isSelected = field.value === level;
                            return (
                              <div key={level} className="flex-1">
                                <RadioGroupItem
                                  value={level}
                                  id={`priority-${level}`}
                                  className="sr-only"
                                />
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="rounded-xl"
                                >
                                  <Label
                                    htmlFor={`priority-${level}`}
                                    className={`flex items-center justify-center h-12 rounded-xl border cursor-pointer transition-all capitalize ${
                                      isSelected
                                        ? 'border-primary bg-primary text-primary-foreground font-medium shadow-sm'
                                        : 'border-primary/10 bg-background/30 hover:bg-accent hover:border-primary/20'
                                    }`}
                                  >
                                    {level}
                                  </Label>
                                </motion.div>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 rounded-2xl text-lg font-medium shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all"
              >
                <Save className="w-5 h-5 mr-2" />
                {isLoading
                  ? activity
                    ? 'Saving...'
                    : 'Creating...'
                  : activity
                  ? 'Save Changes'
                  : 'Create Practice'}
              </Button>
              {activity && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onDelete(activity.id)}
                  disabled={isLoading}
                  className="h-12 text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Practice
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </motion.div>
  );
}
