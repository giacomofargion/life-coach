'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Priority, EffortLevel } from '@/lib/types';
import { ActivityForm } from '@/components/activities/ActivityForm';
import { ActivityList } from '@/components/activities/ActivityList';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);
      const response = await fetch('/api/activities');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: { name: string; priority: Priority; effort_level: EffortLevel }) {
    try {
      setSubmitting(true);
      setError(null);

      if (editingActivity) {
        // Update existing activity
        const response = await fetch(`/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update activity');
        }

        const result = await response.json();
        setActivities((prev) =>
          prev.map((a) => (a.id === editingActivity.id ? result.activity : a))
        );
      } else {
        // Create new activity
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create activity');
        }

        const result = await response.json();
        setActivities((prev) => [result.activity, ...prev]);
      }

      setShowForm(false);
      setEditingActivity(undefined);
    } catch (error) {
      console.error('Error submitting activity:', error);
      setError('Failed to save activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(activity: Activity) {
    setEditingActivity(activity);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingActivity(undefined);
  }

  function handleNewActivity() {
    setEditingActivity(undefined);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Activities</h1>
            <p className="text-muted-foreground">
              Manage your coaching activities and practices
            </p>
          </div>
          <div className="flex gap-2">
            {!showForm && (
              <Button onClick={handleNewActivity}>New Activity</Button>
            )}
            <LogoutButton />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="flex justify-center mb-8">
            <ActivityForm
              activity={editingActivity}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={submitting}
            />
          </div>
        ) : null}

        <ActivityList
          activities={activities}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}
