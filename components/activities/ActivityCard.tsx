'use client';

import { Activity } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const priorityColors = {
  high: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  low: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
};

const effortColors = {
  high: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  medium: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800',
  low: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800',
};

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const effortLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function ActivityCard({
  activity,
  onEdit,
  onDelete,
  isDeleting = false,
}: ActivityCardProps) {
  return (
    <Card className="border shadow-soft bg-card/95 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              {activity.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {effortLabels[activity.effort_level]} Effort • {priorityLabels[activity.priority]} Priority
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(activity)}
            disabled={isDeleting}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            <span>Edit</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
