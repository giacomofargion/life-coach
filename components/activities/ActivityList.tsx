'use client';

import { Activity } from '@/lib/types';
import { ActivityCard } from './ActivityCard';

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export function ActivityList({
  activities,
  onEdit,
  onDelete,
  deletingId,
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No activities yet. Create your first activity to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === activity.id}
        />
      ))}
    </div>
  );
}
