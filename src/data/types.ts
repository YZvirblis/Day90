// src/data/types.ts

export interface ChallengeMeta {
    startDate: Date;
    totalDays: number;
    streakCount: number;
    tokenCount: number;
    points: number;
  }
  
  export interface DayProgress {
    completedHabits: string[];
    isManuallyCompleted: boolean;
    journal?: string;
    imageUri?: string;
  }
  