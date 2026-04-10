/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type View = 'dashboard' | 'assessment' | 'mood' | 'recovery' | 'insights';

export interface MoodEntry {
  id: string;
  date: string;
  score: number; // 1-5
  note?: string;
}

export interface AssessmentResult {
  date: string;
  score: number; // 0-100
  category: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export interface BurnoutHistoryRecord {
  type: 'HIGH' | 'MODERATE' | 'LOW';
  score: number | null;
  time: string | null;
  has_score: boolean;
}

export interface BurnoutHistoryData {
  recent: BurnoutHistoryRecord[];
  high_count: number;
  total: number;
}


export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'Mental' | 'Physical' | 'Productivity';
  duration: string;
  gradient: string;
}
