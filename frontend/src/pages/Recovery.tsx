/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { SUGGESTIONS } from '../constants';
import { ArrowLeft, Clock, Sparkles, Coffee, Wind, Zap, Brain, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { MoodEntry } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

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

const categoryIcons = {
  Mental: Wind,
  Physical: Coffee,
  Productivity: Zap,
};

interface RecoveryProps {
  onBack: () => void;
  burnoutScore: number;
  moodEntries: MoodEntry[];
}

export const Recovery: React.FC<RecoveryProps> = ({ onBack, burnoutScore, moodEntries }) => {
  const latestMood = moodEntries.length > 0 ? moodEntries[moodEntries.length - 1].score : 3;

  const personalizedSuggestions = useMemo(() => {
    let filtered = [...SUGGESTIONS];
    
    if (burnoutScore > 60) {
      filtered.sort((a, b) => {
        if (a.category === 'Productivity' && b.category !== 'Productivity') return 1;
        if (a.category !== 'Productivity' && b.category === 'Productivity') return -1;
        return 0;
      });
    }
    
    if (latestMood <= 2) {
      filtered.sort((a, b) => {
        if (a.category === 'Mental' && b.category !== 'Mental') return -1;
        if (a.category !== 'Mental' && b.category === 'Mental') return 1;
        return 0;
      });
    }

    return filtered;
  }, [burnoutScore, latestMood]);

  const categories = ['Mental', 'Physical', 'Productivity'] as const;

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
          <div className="flex items-center space-x-3">
            <Badge variant={burnoutScore > 60 ? 'rose' : burnoutScore > 30 ? 'amber' : 'emerald'}>
              {burnoutScore > 60 ? 'High Stress' : burnoutScore > 30 ? 'Moderate' : 'Healthy'}
            </Badge>
            <Badge variant={latestMood <= 2 ? 'rose' : latestMood === 3 ? 'indigo' : 'emerald'}>
              Mood: {latestMood <= 2 ? 'Low' : latestMood === 3 ? 'Neutral' : 'Good'}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <Badge variant="indigo">Recovery Plan</Badge>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">Your Path to <span className="text-indigo-600 dark:text-indigo-400 italic font-serif font-normal">Balance</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            Small, intentional steps can make a big difference. Here are some ways to recharge your energy.
          </p>
        </div>
      </motion.header>

      <div className="space-y-20">
        {categories.map((cat) => {
          const catSuggestions = personalizedSuggestions.filter(s => s.category === cat);
          if (catSuggestions.length === 0) return null;

          return (
            <motion.section key={cat} variants={item} className="space-y-10">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                  {React.createElement(categoryIcons[cat], { className: "w-7 h-7 text-indigo-600 dark:text-indigo-400" })}
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{cat} Wellness</h2>
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Recharge your {cat.toLowerCase()} energy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {catSuggestions.map((item) => {
                  const Icon = categoryIcons[item.category as keyof typeof categoryIcons] || Sparkles;
                  return (
                    <Card 
                      key={item.id} 
                      className={cn(
                        "h-full flex flex-col justify-between border-none p-10 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none",
                        "bg-gradient-to-br",
                        item.gradient,
                        "dark:from-slate-900 dark:to-slate-900 dark:bg-slate-900 dark:border dark:border-slate-800"
                      )}
                    >
                      <div className="space-y-8 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="w-14 h-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-white/50 dark:border-slate-700/50">
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm">
                            <Clock className="w-3.5 h-3.5 mr-2" />
                            {item.duration}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{item.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium opacity-80">{item.description}</p>
                        </div>
                      </div>
                      <div className="mt-10 relative z-10">
                        <Button 
                          variant="secondary" 
                          className="w-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black border-none shadow-sm py-4 rounded-2xl transition-all duration-300 active:scale-95"
                        >
                          Try this now <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 dark:bg-slate-800/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    </Card>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      <motion.div variants={item}>
        <Card className="bg-slate-900 dark:bg-slate-950 text-white border-none p-12 lg:p-16 overflow-hidden relative shadow-2xl shadow-slate-300 dark:shadow-none">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-8 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-white/10 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 backdrop-blur-md border border-white/10">
                <Brain className="w-4 h-4" />
                <span>Campus Support</span>
              </div>
              <h3 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">You don't have to carry this alone.</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xl leading-relaxed font-medium">
                Academic burnout is a real challenge. If these small steps don't feel like enough, your university's counseling center is a safe, confidential space to talk. They're there to help you navigate these feelings.
              </p>
            </div>
            <Button variant="primary" className="bg-indigo-500 hover:bg-indigo-400 text-white shrink-0 px-12 py-6 text-xl font-black shadow-2xl shadow-indigo-500/30 rounded-2xl active:scale-95 transition-all">
              View Resources
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -mr-64 -mt-64 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
