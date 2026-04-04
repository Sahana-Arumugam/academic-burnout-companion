/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Assessment } from './pages/Assessment';
import { MoodTracker } from './pages/MoodTracker';
import { Recovery } from './pages/Recovery';
import { Insights } from './pages/Insights';
import { View, MoodEntry, AssessmentResult } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Brain, Heart, Sparkles, TrendingUp, Menu, X, Sun, Moon } from 'lucide-react';
import { Card, Progress, Button } from './components/UI';
import { cn } from './lib/utils';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [burnoutScore, setBurnoutScore] = useState(65);
  const [backendToast, setBackendToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  // Mock initial burnout history
  const [burnoutHistory, setBurnoutHistory] = useState<AssessmentResult[]>([
    { date: new Date(Date.now() - 86400000 * 21).toISOString(), score: 40, category: 'Moderate' },
    { date: new Date(Date.now() - 86400000 * 14).toISOString(), score: 55, category: 'Moderate' },
    { date: new Date(Date.now() - 86400000 * 7).toISOString(), score: 65, category: 'High' },
  ]);
  
  // Mock initial mood data
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([
    { id: '1', date: new Date(Date.now() - 86400000 * 6).toISOString(), score: 4, note: 'Feeling productive.' },
    { id: '2', date: new Date(Date.now() - 86400000 * 5).toISOString(), score: 3, note: 'A bit tired today.' },
    { id: '3', date: new Date(Date.now() - 86400000 * 4).toISOString(), score: 2, note: 'Stressed about the deadline.' },
    { id: '4', date: new Date(Date.now() - 86400000 * 3).toISOString(), score: 2, note: 'Tough day at the library.' },
    { id: '5', date: new Date(Date.now() - 86400000 * 2).toISOString(), score: 3, note: 'Feeling okay, just tired.' },
    { id: '6', date: new Date(Date.now() - 86400000 * 1).toISOString(), score: 4, note: 'Great progress on my thesis!' },
  ]);

  const handleAddMoodEntry = (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
    };
    setMoodEntries([...moodEntries, newEntry]);
  };

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    setBackendToast({ message, type });
    setTimeout(() => setBackendToast(null), 6000);
  }, []);

  const handleAssessmentComplete = useCallback(async (score: number) => {
    setBurnoutScore(score);

    // Map score to category (aligned with Flask backend thresholds)
    let category: AssessmentResult['category'] = 'Low';
    if (score > 70) category = 'Severe';
    else if (score > 40) category = 'High';
    else if (score > 20) category = 'Moderate';

    const newResult: AssessmentResult = {
      date: new Date().toISOString(),
      score,
      category,
    };
    setBurnoutHistory(prev => [...prev, newResult]);

    // Send score to Flask backend → triggers SaltStack automation
    try {
      const res = await fetch(`http://127.0.0.1:5000/trigger-recovery/${score}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[Backend] Non-OK response:', res.status, errData);
        showToast(`Backend error (${res.status}): ${errData.error ?? 'Unknown error'}`, 'error');
        return;
      }

      const data = await res.json();
      console.log('[Backend] Response:', data);

      const toastType = score > 70 ? 'error' : score > 40 ? 'warning' : 'success';
      const saltNote = data.salt_triggered
        ? ' • SaltStack automation triggered ✓'
        : data.salt_error
          ? ` • Salt: ${data.salt_error}`
          : '';
      showToast(`${data.status}${saltNote}`, toastType);

    } catch (err) {
      console.error('[Backend] Network error:', err);
      showToast('Could not reach backend (is Flask running on port 5000?)', 'error');
    }
  }, [burnoutHistory, showToast]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: 'Assessment', icon: Brain },
    { id: 'mood', label: 'Mood Tracker', icon: Heart },
    { id: 'recovery', label: 'Recovery', icon: Sparkles },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} moodEntries={moodEntries} burnoutScore={burnoutScore} />;
      case 'assessment': return <Assessment onBack={() => setCurrentView('dashboard')} onComplete={handleAssessmentComplete} />;
      case 'mood': return (
        <MoodTracker 
          onBack={() => setCurrentView('dashboard')} 
          entries={moodEntries}
          onAddEntry={handleAddMoodEntry}
        />
      );
      case 'recovery': return (
        <Recovery 
          onBack={() => setCurrentView('dashboard')} 
          burnoutScore={burnoutScore}
          moodEntries={moodEntries}
        />
      );
      case 'insights': return (
        <Insights 
          onBack={() => setCurrentView('dashboard')} 
          moodEntries={moodEntries}
          burnoutHistory={burnoutHistory}
        />
      );
      default: return <Dashboard onNavigate={setCurrentView} moodEntries={moodEntries} burnoutScore={burnoutScore} />;
    }
  };

  // Toast colour mapping
  const toastStyles = {
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    error:   'bg-rose-600 text-white',
    info:    'bg-indigo-600 text-white',
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-8 sticky top-0 h-screen transition-colors duration-300">
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Companion</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-xl"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  "w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white dark:text-slate-900" : "text-slate-400 dark:text-slate-500")} />
                <span className="font-semibold text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-2xl bg-slate-900 dark:bg-slate-100 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-none p-5 rounded-3xl relative overflow-hidden group" hover={false}>
            <div className="relative z-10">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Weekly Goal</p>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-3">3/5 Mood Logs</p>
              <Progress value={60} color="bg-indigo-500" className="h-1.5" />
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-100 dark:bg-indigo-800/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </Card>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-slate-900 dark:text-white" />
          <span className="font-extrabold text-lg dark:text-white">Companion</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-xl"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 z-50 p-8 lg:hidden shadow-2xl transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-slate-900 dark:text-white" />
                  <span className="font-extrabold text-xl dark:text-white">Companion</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id as View);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all",
                        isActive 
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg" 
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-bold text-base">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pl-0 pt-20 lg:pt-0">
        <div className="h-full px-6 py-8 lg:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Backend status toast */}
      <AnimatePresence>
        {backendToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className={`fixed bottom-6 right-6 z-[9999] max-w-sm px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold leading-relaxed flex items-start gap-3 ${toastStyles[backendToast.type]}`}
          >
            <span className="mt-0.5 text-lg">
              {backendToast.type === 'success' ? '✅' : backendToast.type === 'warning' ? '🟡' : backendToast.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{backendToast.message}</span>
            <button
              onClick={() => setBackendToast(null)}
              className="ml-auto opacity-70 hover:opacity-100 transition-opacity text-base leading-none"
              aria-label="Dismiss"
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
