/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { ArrowLeft, TrendingUp, Calendar, AlertCircle, CheckCircle2, Info, ArrowDown, ArrowUp, Heart, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MoodEntry, AssessmentResult } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

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

interface InsightsProps {
  onBack: () => void;
  moodEntries: MoodEntry[];
  burnoutHistory: AssessmentResult[];
}

export const Insights: React.FC<InsightsProps> = ({ onBack, moodEntries, burnoutHistory }) => {
  const moodData = useMemo(() => {
    return [...moodEntries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map(entry => ({
        day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
        score: entry.score,
      }));
  }, [moodEntries]);

  const burnoutData = useMemo(() => {
    return [...burnoutHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5)
      .map((entry, i) => ({
        week: `W${i + 1}`,
        score: entry.score,
      }));
  }, [burnoutHistory]);

  const insights = useMemo(() => {
    if (moodEntries.length < 3) return null;

    const avgMood = moodEntries.reduce((acc, curr) => acc + curr.score, 0) / moodEntries.length;
    
    const dayScores: Record<string, { total: number, count: number }> = {};
    moodEntries.forEach(entry => {
      const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayScores[day]) dayScores[day] = { total: 0, count: 0 };
      dayScores[day].total += entry.score;
      dayScores[day].count += 1;
    });

    let lowestDay = '';
    let lowestScore = 6;
    Object.entries(dayScores).forEach(([day, data]) => {
      const avg = data.total / data.count;
      if (avg < lowestScore) {
        lowestScore = avg;
        lowestDay = day;
      }
    });

    const latestBurnout = burnoutHistory[burnoutHistory.length - 1]?.score || 0;
    const prevBurnout = burnoutHistory[burnoutHistory.length - 2]?.score || 0;
    const burnoutChange = latestBurnout - prevBurnout;

    return {
      avgMood: avgMood.toFixed(1),
      lowestDay,
      burnoutChange,
      isImproving: burnoutChange < 0
    };
  }, [moodEntries, burnoutHistory]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-12 pb-16"
    >
      <motion.header variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0 h-auto font-bold group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back
          </Button>
          <Badge variant="indigo">Deep Analysis</Badge>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">Your Wellness <span className="text-indigo-600 dark:text-indigo-400 italic font-serif font-normal">Journey</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            Understanding your academic experience through the lens of your own data.
          </p>
        </div>
      </motion.header>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 flex items-center space-x-6 group shadow-xl shadow-slate-200/50 dark:shadow-none border-none" hover={true}>
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Avg. Mood</p>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{insights?.avgMood || 'N/A'}</h4>
          </div>
        </Card>
        
        <Card className="p-8 flex items-center space-x-6 group shadow-xl shadow-slate-200/50 dark:shadow-none border-none" hover={true}>
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Burnout Trend</p>
            <div className="flex items-center space-x-3">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {insights ? (insights.isImproving ? 'Improving' : 'Increasing') : 'Stable'}
              </h4>
              {insights && (
                insights.isImproving ? <ArrowDown className="w-5 h-5 text-emerald-500" /> : <ArrowUp className="w-5 h-5 text-rose-500" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-8 flex items-center space-x-6 group shadow-xl shadow-slate-200/50 dark:shadow-none border-none" hover={true}>
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Consistency</p>
            <h4 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{moodEntries.length} Days</h4>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trend Chart */}
        <Card className="p-10 space-y-10 shadow-xl shadow-slate-200/50 dark:shadow-none border-none">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mood Fluctuations</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Last 7 Days</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 800}} 
                  dy={15}
                />
                <YAxis hide domain={[1, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '20px' }}
                  labelStyle={{ fontWeight: '900', marginBottom: '8px', color: '#1e293b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorMood)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Burnout Trend Chart */}
        <Card className="p-10 space-y-10 shadow-xl shadow-slate-200/50 dark:shadow-none border-none">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Burnout Trajectory</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Assessment History</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnoutData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 800}} 
                  dy={15}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '20px' }}
                  labelStyle={{ fontWeight: '900', marginBottom: '8px', color: '#1e293b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#a855f7" 
                  radius={[12, 12, 0, 0]} 
                  barSize={48}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Pattern Highlights */}
      <motion.section variants={item} className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pattern Highlights</h3>
          <Badge variant="indigo">AI Insights</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-rose-50 dark:bg-rose-900/20 border-none p-10 space-y-8 relative overflow-hidden group shadow-xl shadow-rose-100/50 dark:shadow-none" hover={false}>
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-sm relative z-10 transition-transform duration-500 group-hover:scale-110">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-4 relative z-10">
              <h4 className="text-2xl font-black text-rose-900 dark:text-rose-100 tracking-tight">Weekly Dip</h4>
              <p className="text-rose-700/80 dark:text-rose-200/80 leading-relaxed font-medium text-lg">
                Your mood tends to be lowest on <span className="font-black underline decoration-rose-300 dark:decoration-rose-700 underline-offset-8">{insights?.lowestDay || 'specific days'}</span>. Consider scheduling a recovery activity during this time.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-100 dark:bg-rose-900/20 rounded-full blur-3xl opacity-50" />
          </Card>
          
          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-none p-10 space-y-8 relative overflow-hidden group shadow-xl shadow-indigo-100/50 dark:shadow-none" hover={false}>
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm relative z-10 transition-transform duration-500 group-hover:scale-110">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="space-y-4 relative z-10">
              <h4 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 tracking-tight">Positive Shift</h4>
              <p className="text-indigo-700/80 dark:text-indigo-200/80 leading-relaxed font-medium text-lg">
                {insights && insights.isImproving 
                  ? `Great job! Your burnout score has decreased by ${Math.abs(insights.burnoutChange)}% since your last assessment.`
                  : "Consistency in tracking is the first step to improvement. Keep logging your mood to see more accurate trends."}
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50" />
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-none p-10 space-y-8 relative overflow-hidden group shadow-xl shadow-emerald-100/50 dark:shadow-none" hover={false}>
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm relative z-10 transition-transform duration-500 group-hover:scale-110">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-4 relative z-10">
              <h4 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">Self-Care Wins</h4>
              <p className="text-emerald-700/80 dark:text-emerald-200/80 leading-relaxed font-medium text-lg">
                You've logged {moodEntries.length} reflections. This self-awareness is a powerful tool against academic burnout.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50" />
          </Card>
        </div>
      </motion.section>

      {/* Advice Card */}
      <motion.div variants={item}>
        <Card className="bg-slate-900 dark:bg-slate-950 text-white border-none p-12 lg:p-16 flex flex-col md:flex-row items-center space-y-10 md:space-y-0 md:space-x-12 relative overflow-hidden shadow-2xl shadow-slate-300 dark:shadow-none">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 shadow-sm shrink-0 backdrop-blur-md relative z-10 border border-white/10 transition-transform duration-500 hover:scale-110">
            <Info className="w-12 h-12" />
          </div>
          <div className="space-y-6 relative z-10 text-center md:text-left">
            <h4 className="text-3xl lg:text-4xl font-black tracking-tight">Context Matters</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xl leading-relaxed font-medium max-w-4xl">
              Data is just one part of the story. If you notice a trend that doesn't feel right, or if you're going through a particularly difficult exam week, be kind to yourself. These numbers are here to support you, not define you.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-20 -mb-20 blur-[80px]" />
        </Card>
      </motion.div>
    </motion.div>
  );
};
