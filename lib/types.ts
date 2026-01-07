// TypeScript types for the application

export type Priority = 'high' | 'medium' | 'low';
export type EffortLevel = 'high' | 'medium' | 'low';
export type SessionType = 'morning' | 'afternoon';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  name: string;
  priority: Priority;
  effort_level: EffortLevel;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_type: SessionType;
  energy_level: EnergyLevel;
  created_at: string;
  mainActivity?: Activity | null;
  fillerActivity?: Activity | null;
}

export interface SessionActivity {
  id: string;
  session_id: string;
  activity_id: string;
  is_main: boolean;
  is_filler: boolean;
}

export interface CoachSuggestion {
  mainActivity: Activity | null;
  fillerActivity: Activity | null;
  quote: string;
  reflectionPrompt: string;
}

// NextAuth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }

  interface User {
    id: string;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
