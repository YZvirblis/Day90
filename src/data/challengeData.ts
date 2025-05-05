// src/data/challengeData.ts

import { ChallengeMeta, DayProgress } from '../data/types';



export const mockData: {
  meta: ChallengeMeta;
  progress: Record<number, DayProgress>;
} = {
  meta: {
    startDate: new Date(2025, 3, 19), // April 19, 2025
    totalDays: 90,
    streakCount: 4,
    tokenCount: 1,
    points: 120,
  },
  progress: {
    1: {
      completedHabits: ['Drink Water', 'Stretch', 'Read Book'],
      isManuallyCompleted: true,
      journal: 'Good start to the challenge!',
    },
    2: {
      completedHabits: ['Drink Water'],
      isManuallyCompleted: true,
    },
    3: {
      completedHabits: ['Drink Water'],
      isManuallyCompleted: false,
    },
    4: {
      completedHabits: [],
      isManuallyCompleted: false,
    },
  },
};
