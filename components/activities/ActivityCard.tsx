'use client';

import { Activity } from '@/lib/types';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const effortLabels = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const priorityLabels = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

export function ActivityCard({
  activity,
  onEdit,
  onDelete,
  isDeleting = false,
}: ActivityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        onClick={() => !isDeleting && onEdit(activity)}
        className="p-6 bg-card/50 backdrop-blur-sm border-2 flex items-center justify-between cursor-pointer group hover:bg-white/60 transition-all shadow-sm hover:shadow-md rounded-2xl"
      >
        <div className="space-y-1">
          <h3 className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
            {activity.name}
          </h3>
          <div className="flex gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground/60">
              {effortLabels[activity.effort_level]} Effort
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-primary/60">
              {priorityLabels[activity.priority]} Priority
            </span>
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
      </Card>
    </motion.div>
  );
}
