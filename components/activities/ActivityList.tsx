'use client';

import { Activity } from '@/lib/types';
import { ActivityCard } from './ActivityCard';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
  onAddNew?: () => void;
}

export function ActivityList({
  activities,
  onEdit,
  onDelete,
  deletingId,
  onAddNew,
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="grid gap-4">
        {onAddNew && (
          <Button
            variant="outline"
            onClick={onAddNew}
            className="border-dashed h-24 border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-2xl text-muted-foreground text-lg transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Add New Practice
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === activity.id}
        />
      ))}
      {onAddNew && (
        <Button
          variant="outline"
          onClick={onAddNew}
          className="border-dashed h-24 border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-2xl text-muted-foreground text-lg transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Add New Practice
        </Button>
      )}
    </div>
  );
}
