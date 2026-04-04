/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, Button, Progress, Badge } from '../components/UI';
import { ASSESSMENT_QUESTIONS } from '../constants';
import { ArrowLeft, ArrowRight, CheckCircle2, Brain, Sparkles, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export const Assessment: React.FC<{ onBack: () => void; onComplete: (score: number) => void }> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(ASSESSMENT_QUESTIONS.length).fill(0));
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
    
    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
      const total = newAnswers.reduce((acc, curr) => acc + curr, 0);
      const max = ASSESSMENT_QUESTIONS.length * 5;
      onComplete(Math.round((total / max) * 100));
    }
  };

  const calculateScore = () => {
    const total = answers.reduce((acc, curr) => acc + curr, 0);
    const max = ASSESSMENT_QUESTIONS.length * 5;
    return Math.round((total / max) * 100);
  };

  const getCategoryScores = () => {
    const categories: Record<string, { total: number, count: number }> = {};
    ASSESSMENT_QUESTIONS.forEach((q, i) => {
      if (!categories[q.category]) categories[q.category] = { total: 0, count: 0 };
      categories[q.category].total += answers[i];
      categories[q.category].count += 1;
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      score: Math.round((data.total / (data.count * 5)) * 100)
    }));
  };

  if (isFinished) {
    const score = calculateScore();
    let category = 'Low Burnout';
    let color = 'text-emerald-500 dark:text-emerald-400';
    let bgColor = 'bg-emerald-50 dark:bg-emerald-900/30';
    let badgeVariant: 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate' = 'emerald';
    let message = "You're doing great! Your stress levels seem manageable. Keep prioritizing your well-being to stay on this healthy track.";
    let explanation = "Your responses suggest that while you might feel occasional pressure, you still have a good balance between your studies and personal life.";

    if (score > 70) {
      category = 'High Burnout';
      color = 'text-rose-500 dark:text-rose-400';
      bgColor = 'bg-rose-50 dark:bg-rose-900/30';
      badgeVariant = 'rose' as const;
      message = "It sounds like you're carrying a very heavy load right now. Please remember that your health is more important than any grade. You don't have to do this alone.";
      explanation = "Your scores in several areas are quite high, indicating significant emotional and physical exhaustion. This is a clear signal from your body that it needs a real break.";
    } else if (score > 35) {
      category = 'Moderate Burnout';
      color = 'text-amber-500 dark:text-amber-400';
      bgColor = 'bg-amber-50 dark:bg-amber-900/30';
      badgeVariant = 'amber' as const;
      message = "You're starting to feel the strain. This is the perfect time to pause and adjust your routine before things get more difficult.";
      explanation = "You're showing some common signs of academic fatigue. You might find yourself feeling more tired or less motivated than usual, but with some intentional rest, you can bounce back.";
    }

    return (
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-12 py-8"
      >
        <motion.header variants={item} className="text-center space-y-6">
          <Badge variant="indigo">Assessment Complete</Badge>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">Your Wellness <span className="text-indigo-600 dark:text-indigo-400 italic font-serif font-normal">Insights</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            We've analyzed your responses across stress, sleep, motivation, and focus.
          </p>
        </motion.header>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-10 flex flex-col items-center text-center space-y-10 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none border-none">
            <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", bgColor, color)}>
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <div className="space-y-4">
              <Badge variant={badgeVariant}>{category}</Badge>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">{score}%</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Overall Burnout Score</p>
            </div>

            <Progress value={score} color={color.replace('text-', 'bg-')} className="h-4" />
            
            <div className="space-y-4 pt-4">
              <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed">{explanation}</p>
            </div>
          </Card>

          <Card className="p-10 space-y-10 bg-slate-900 dark:bg-slate-900 text-white border-none shadow-2xl shadow-slate-200 dark:shadow-none">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-2xl font-black tracking-tight">What this means</h4>
            </div>
            
            <div className="space-y-8">
              <p className="text-white/70 leading-relaxed text-xl italic font-medium">
                {explanation}
              </p>
              
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 relative">
                <Quote className="absolute -top-4 -left-4 w-10 h-10 text-indigo-500/30" />
                <p className="text-indigo-300 font-bold leading-relaxed text-lg">
                  {message}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {getCategoryScores().map((cat) => (
            <Card key={cat.name} className="p-8 text-center space-y-4 shadow-lg shadow-slate-100 dark:shadow-none border-none" hover={true}>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{cat.name}</p>
              <h5 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{cat.score}%</h5>
              <Progress value={cat.score} color={cat.score > 70 ? 'bg-rose-500' : cat.score > 35 ? 'bg-amber-500' : 'bg-emerald-500'} className="h-2.5" />
            </Card>
          ))}
        </motion.div>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <Button onClick={onBack} variant="outline" className="px-12 py-6 text-lg font-black rounded-2xl border-2 hover:bg-slate-50 transition-all">Back to Dashboard</Button>
          <Button onClick={() => window.location.reload()} className="px-12 py-6 text-lg font-black rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 transition-all">Retake Assessment</Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-12 py-8"
    >
      <motion.header variants={item} className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0 h-auto font-bold group">
          <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Exit Assessment
        </Button>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Question</p>
            <p className="text-sm font-black text-indigo-500 dark:text-indigo-400 tabular-nums">{step + 1} of {ASSESSMENT_QUESTIONS.length}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Brain className="w-8 h-8" />
          </div>
        </div>
      </motion.header>

      <motion.div variants={item} className="space-y-6">
        <div className="flex justify-between items-end">
          <Badge variant="indigo">Progress</Badge>
          <span className="text-sm font-black text-slate-400 dark:text-slate-500 tabular-nums">{Math.round(((step + 1) / ASSESSMENT_QUESTIONS.length) * 100)}%</span>
        </div>
        <Progress value={step + 1} max={ASSESSMENT_QUESTIONS.length} className="h-4 shadow-sm" />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="p-12 lg:p-16 space-y-12 relative overflow-hidden group shadow-2xl shadow-slate-200/50 dark:shadow-none border-none">
            <div className="space-y-6 text-center relative z-10">
              <Badge variant="slate">{ASSESSMENT_QUESTIONS[step].category}</Badge>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                {ASSESSMENT_QUESTIONS[step].text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10">
              {[
                { label: 'Never', value: 1 },
                { label: 'Rarely', value: 2 },
                { label: 'Sometimes', value: 3 },
                { label: 'Often', value: 4 },
                { label: 'Always', value: 5 },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-8 text-left rounded-3xl border-2 border-slate-50 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all duration-300 flex justify-between items-center group/btn active:scale-[0.98] cursor-pointer"
                >
                  <span className="text-xl font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{option.label}</span>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-1000" />
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.div variants={item} className="flex justify-between items-center pt-4">
        <Button 
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-slate-400 dark:text-slate-500 font-bold disabled:opacity-30 transition-all hover:text-slate-600 dark:hover:text-slate-300"
        >
          Previous Question
        </Button>
        <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Question {step + 1} of {ASSESSMENT_QUESTIONS.length}
        </p>
      </motion.div>
    </motion.div>
  );
};
