'use client';

import { Activity } from '@/lib/types';
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
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const effortColors = {
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  low: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{activity.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[activity.priority]}`}
          >
            Priority: {priorityLabels[activity.priority]}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${effortColors[activity.effort_level]}`}
          >
            Effort: {effortLabels[activity.effort_level]}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(activity)}
          disabled={isDeleting}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(activity.id)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
