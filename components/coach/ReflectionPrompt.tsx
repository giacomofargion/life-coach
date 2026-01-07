'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ReflectionPromptProps {
  prompt: string;
  onSave?: (reflection: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReflectionPrompt({
  prompt,
  onSave,
  isLoading = false,
}: ReflectionPromptProps) {
  const [reflection, setReflection] = useState('');

  async function handleSave() {
    if (onSave && reflection.trim()) {
      await onSave(reflection);
      setReflection('');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
          <CardDescription>Take a moment to reflect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{prompt}</p>
          {onSave && (
            <>
              <Textarea
                placeholder="Share your thoughts..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                disabled={isLoading}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleSave}
                disabled={isLoading || !reflection.trim()}
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Save Reflection'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
