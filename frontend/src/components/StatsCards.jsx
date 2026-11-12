import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  Brain,
  Sparkles
} from 'lucide-react';

export default function StatsCards({ problems = [], dueCards = [], onStartReview }) {
  const totalCount = problems.length;
  const dueCount = dueCards.length;

  const easyCount = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardCount = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  // Calculate average easiness factor
  const totalEasiness = problems.reduce((acc, p) => acc + (p.review_data?.easiness || 2.5), 0);
  const avgEasiness = totalCount > 0 ? (totalEasiness / totalCount).toFixed(2) : '2.50';

  // Calculate mastered problems (repetition >= 3)
  const masteredCount = problems.filter(p => (p.review_data?.repetition || 0) >= 3).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Total Problems */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/10 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Total Tracked</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{totalCount}</span>
          <span className="text-xs text-slate-500">problems</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{masteredCount} in long-term memory</span>
        </div>
      </div>

      {/* 2. Due for Review Today */}
      <div className={`p-5 rounded-2xl border backdrop-blur-sm shadow-sm relative overflow-hidden transition-all ${
        dueCount > 0
          ? 'bg-amber-950/20 border-amber-500/40 shadow-amber-500/5'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${dueCount > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
            Due for Review
          </span>
          <div className={`p-2 rounded-xl ${dueCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${dueCount > 0 ? 'text-amber-300' : 'text-white'}`}>
              {dueCount}
            </span>
            <span className="text-xs text-slate-500">due today</span>
          </div>
          {dueCount > 0 && (
            <button
              onClick={onStartReview}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              Review Now
            </button>
          )}
        </div>
        <div className="mt-3 text-xs text-slate-400">
          {dueCount === 0 ? '🎉 All caught up for today!' : '⚡ Spaced repetition interval reached'}
        </div>
      </div>

      {/* 3. Difficulty Split */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Difficulty Split</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase">Easy</div>
            <div className="text-lg font-bold text-emerald-300">{easyCount}</div>
          </div>
          <div className="flex-1 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-[10px] text-amber-400 font-semibold uppercase">Med</div>
            <div className="text-lg font-bold text-amber-300">{mediumCount}</div>
          </div>
          <div className="flex-1 px-2 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
            <div className="text-[10px] text-rose-400 font-semibold uppercase">Hard</div>
            <div className="text-lg font-bold text-rose-300">{hardCount}</div>
          </div>
        </div>
      </div>

      {/* 4. SM-2 Algorithm Mastery */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Retention Mastery</span>
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
            <Brain className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{avgEasiness}</span>
          <span className="text-xs text-slate-500">avg ease factor</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Scale: 1.30 (Hard) → 2.50+ (Solid)</span>
        </div>
      </div>

    </div>
  );
}
