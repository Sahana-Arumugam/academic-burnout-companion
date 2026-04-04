/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suggestion } from './types';

export const SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    title: 'Digital Detox',
    description: 'Unplug from all screens for a while. Your eyes and mind deserve a quiet moment away from the notification buzz.',
    category: 'Mental',
    duration: '30m',
    gradient: 'from-blue-50 to-indigo-50'
  },
  {
    id: '2',
    title: 'Gentle Movement',
    description: 'A short walk or some light stretching can help release physical tension built up from long study hours.',
    category: 'Physical',
    duration: '15m',
    gradient: 'from-emerald-50 to-teal-50'
  },
  {
    id: '3',
    title: 'Pomodoro Technique',
    description: 'Break your work into 25-minute chunks with 5-minute breaks. It makes large tasks feel much more approachable.',
    category: 'Productivity',
    duration: '30m',
    gradient: 'from-amber-50 to-orange-50'
  },
  {
    id: '4',
    title: 'Sleep Sanctuary',
    description: 'Try to dim the lights and avoid caffeine this evening. Quality sleep is the foundation of recovery.',
    category: 'Physical',
    duration: '8h',
    gradient: 'from-purple-50 to-fuchsia-50'
  },
  {
    id: '5',
    title: 'Box Breathing',
    description: 'Inhale for 4, hold for 4, exhale for 4, hold for 4. A simple way to reset your nervous system.',
    category: 'Mental',
    duration: '5m',
    gradient: 'from-rose-50 to-pink-50'
  },
  {
    id: '6',
    title: 'Mindful Journaling',
    description: 'Write down three things you achieved today, no matter how small. Celebrate your progress.',
    category: 'Mental',
    duration: '10m',
    gradient: 'from-cyan-50 to-blue-50'
  },
  {
    id: '7',
    title: 'Single-Tasking',
    description: 'Focus on just one thing at a time. Close those extra tabs and give your brain some breathing room.',
    category: 'Productivity',
    duration: 'Var',
    gradient: 'from-slate-50 to-slate-100'
  }
];

export const ASSESSMENT_QUESTIONS = [
  { text: "I feel emotionally drained by my academic workload.", category: "stress" },
  { text: "I find it difficult to relax even when I'm not studying.", category: "stress" },
  { text: "I feel physically exhausted after a typical day of classes.", category: "stress" },
  { text: "I struggle to fall asleep because I'm worrying about my studies.", category: "sleep" },
  { text: "I wake up feeling tired and unrefreshed most mornings.", category: "sleep" },
  { text: "My sleep quality has noticeably declined recently.", category: "sleep" },
  { text: "I feel less interested in my subjects than I used to be.", category: "motivation" },
  { text: "I find myself procrastinating more than usual.", category: "motivation" },
  { text: "I feel like my academic goals are no longer meaningful.", category: "motivation" },
  { text: "I find it hard to concentrate on a single task for more than 15 minutes.", category: "focus" },
  { text: "I often feel 'foggy' or unable to think clearly during lectures.", category: "focus" },
  { text: "I easily get distracted by small things while trying to study.", category: "focus" }
];
