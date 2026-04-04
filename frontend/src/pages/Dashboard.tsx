/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, Button, Progress, Badge } from '../components/UI';
import { Heart, Brain, TrendingUp, Zap, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { MoodEntry, AssessmentResult } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (view: string) => void;
  moodEntries: MoodEntry[];
  burnoutScore: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, moodEntries, burnoutScore }) => {
  const recentMoodEntry = moodEntries.length > 0 ? moodEntries[moodEntries.length - 1] : null;
  const averageMood = moodEntries.length > 0 
    ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.score, 0) / moodEntries.length) 
    : 0;

  const getBurnoutCategory = (score: number) => {
    if (score > 70) return { label: 'High Burnout', color: 'rose', variant: 'rose' as const };
    if (score > 40) return { label: 'Moderate', color: 'amber', variant: 'amber' as const };
    return { label: 'Healthy', color: 'emerald', variant: 'emerald' as const };
  };

  const burnoutStatus = getBurnoutCategory(burnoutScore);

  const quickActions = [
    { label: 'Take Assessment', icon: Brain, onClick: () => onNavigate('assessment'), color: 'indigo' },
    { label: 'Log Mood', icon: Heart, onClick: () => onNavigate('mood'), color: 'rose' },
    { label: 'Recovery Tips', icon: Sparkles, onClick: () => onNavigate('recovery'), color: 'amber' },
    { label: 'Insights', icon: TrendingUp, onClick: () => onNavigate('insights'), color: 'emerald' },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-2">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Here's your wellness overview
        </p>
      </motion.div>

      {/* Main Score Card */}
      <motion.div variants={item}>
        <Card className="p-12 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border-indigo-100 dark:border-indigo-800/50 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Badge variant={burnoutStatus.variant}>{burnoutStatus.label}</Badge>
              </div>
              <div>
                <h2 className="text-white/50 text-sm font-bold uppercase tracking-wider mb-2">Current Burnout Score</h2>
                <div className="text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tabular-nums">
                  {burnoutScore}%
                </div>
              </div>
              <Progress value={burnoutScore} className="h-3" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {burnoutScore > 70 
                  ? "You're experiencing high burnout. Consider taking a break and reaching out for support."
                  : burnoutScore > 40
                  ? "You're showing some signs of burnout. It's a good time to adjust your routine."
                  : "Great job! You're maintaining a healthy balance."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Average Mood</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{averageMood}/5</p>
              </Card>

              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Mood Entries</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{moodEntries.length}</p>
              </Card>

              {recentMoodEntry && (
                <Card className="p-6 col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Latest Entry</p>
                  <p className="text-slate-800 dark:text-slate-100 font-medium mb-2">{recentMoodEntry.note || 'No note'}</p>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(recentMoodEntry.date).toLocaleDateString()}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Card 
                key={idx}
                className="p-6 hover:shadow-lg transition-all cursor-pointer border-slate-200 dark:border-slate-800"
                onClick={action.onClick}
              >
                <div className="flex flex-col items-start space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{action.label}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={item}>
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800/50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                {burnoutScore > 70 ? "Important: Please Take Care" : "Stay On Track"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {burnoutScore > 70 
                  ? "Your burnout indicators are high. Consider scheduling one-on-one time with a counselor and prioritize rest. Your health comes first."
                  : burnoutScore > 40
                  ? "Keep monitoring your mood and stress levels. Try incorporating regular breaks and relaxation techniques into your routine."
                  : "Excellent work maintaining your balance! Continue with your current habits and remember to check in with yourself regularly."}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
