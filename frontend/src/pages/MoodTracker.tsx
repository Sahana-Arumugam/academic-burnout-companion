/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { ArrowLeft, Smile, Meh, CloudLightning, BatteryLow, Heart, Calendar, MessageSquare, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry } from '../types';
import { cn } from '../lib/utils';

interface MoodTrackerProps {
  onBack: () => void;
  entries: MoodEntry[];
  onAddEntry: (entry: Omit<MoodEntry, 'id'>) => void;
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

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onBack, entries, onAddEntry }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const moods = [
    { label: 'Exhausted', icon: BatteryLow, value: 1, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', activeBg: 'bg-slate-100 dark:bg-slate-700', badge: 'slate' as const },
    { label: 'Stressed', icon: CloudLightning, value: 2, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', activeBg: 'bg-amber-100 dark:bg-amber-900/50', badge: 'amber' as const },
    { label: 'Neutral', icon: Meh, value: 3, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', activeBg: 'bg-indigo-100 dark:bg-indigo-900/50', badge: 'indigo' as const },
    { label: 'Happy', icon: Smile, value: 4, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', activeBg: 'bg-emerald-100 dark:bg-emerald-900/50', badge: 'emerald' as const },
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      onAddEntry({
        date: new Date().toISOString(),
        score: selectedMood,
        note: note.trim() || undefined,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedMood(null);
        setNote('');
      }, 2000);
    }
  };

  const chartData = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(entry => ({
      day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      score: entry.score,
    }));

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-12 pb-12"
    >
      <motion.header variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0 h-auto font-bold group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back
          </Button>
          <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest">
            <Calendar className="w-3 h-3" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Badge variant="indigo">Daily Check-in</Badge>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">Mood <span className="text-indigo-600 dark:text-indigo-400 italic font-serif font-normal">Tracker</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            Acknowledge your emotions without judgment. How is your heart today?
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Section */}
        <motion.div variants={item} className="lg:col-span-3 space-y-8">
          <Card className="p-10 space-y-10 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none border-none">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-10"
                >
                  <motion.div 
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-100 dark:shadow-none"
                  >
                    <Heart className="w-10 h-10 fill-current" />
                  </motion.div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">Reflection Saved</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Thank you for checking in with yourself.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">How are you feeling?</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex flex-col items-center space-y-4 p-8 rounded-[2.5rem] transition-all duration-300 group cursor-pointer border-2",
                      selectedMood === mood.value 
                        ? `${mood.activeBg} ${mood.color} border-indigo-500 shadow-xl shadow-indigo-100/50 scale-105` 
                        : `${mood.bg} ${mood.color} border-transparent opacity-60 hover:opacity-100 hover:scale-102`
                    )}
                  >
                    <mood.icon className={cn("w-12 h-12 transition-transform duration-300", selectedMood === mood.value ? 'scale-110' : 'group-hover:scale-110')} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                  Add a reflection
                </div>
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Optional</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full h-48 p-8 rounded-[2rem] border-none outline-none transition-all resize-none text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg shadow-inner dark:shadow-none"
              />
            </div>

            <Button 
              disabled={!selectedMood} 
              onClick={handleSubmit}
              className="w-full py-6 text-xl font-black shadow-2xl shadow-indigo-500/30 rounded-2xl active:scale-[0.98] transition-all"
            >
              Save Reflection
            </Button>
            
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-50 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-1000" />
          </Card>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Reflections</h3>
              <Badge variant="slate">History</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {entries.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent" hover={false}>
                  <p className="text-slate-400 dark:text-slate-500 font-bold italic text-lg">Your journey starts here. Log your first mood above.</p>
                </Card>
              ) : (
                entries.slice().reverse().slice(0, 3).map((entry) => {
                  const mood = moods.find(m => m.value === entry.score) || moods[2];
                  return (
                    <Card key={entry.id} className="flex items-start space-x-8 p-8 group shadow-lg shadow-slate-100 dark:shadow-none border-none" hover={true}>
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110", mood.bg, mood.color)}>
                        <mood.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex justify-between items-center">
                          <Badge variant={mood.badge}>{mood.label}</Badge>
                          <div className="flex items-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
                            <Clock className="w-3.5 h-3.5 mr-2" />
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                        {entry.note && <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium line-clamp-2 italic">"{entry.note}"</p>}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </motion.div>

        {/* Visualization Section */}
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          <Card className="p-10 space-y-10 sticky top-24 shadow-xl shadow-slate-200/50 dark:shadow-none border-none">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
                  <TrendingUp className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400" />
                  Weekly Trend
                </h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Emotional Flow</p>
              </div>
            </div>

            {chartData.length < 2 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <TrendingUp className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-lg text-slate-400 dark:text-slate-500 font-bold leading-relaxed max-w-[220px]">
                  Log your mood for a few more days to unlock your trend visualization.
                </p>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                      dy={10}
                    />
                    <YAxis hide domain={[1, 4]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '20px' }}
                      labelStyle={{ fontWeight: '900', marginBottom: '8px', color: '#1e293b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={6} 
                      fillOpacity={1} 
                      fill="url(#colorMood)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-8 pt-10 border-t border-slate-50 dark:border-slate-800">
              <h4 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Mood Insights</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">Average Mood</span>
                  </div>
                  <Badge variant="emerald">Good</Badge>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300">Most Frequent</span>
                  </div>
                  <Badge variant="indigo">Happy</Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
