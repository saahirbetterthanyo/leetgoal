import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Brain,
  CheckCircle2,
} from 'lucide-react';

export function calculateNextIntervalPreview(grade, currentRep = 0, currentInterval = 1, currentEase = 2.5) {
  const rep = Number(currentRep) || 0;
  const interval = Number(currentInterval) || 1;
  const ease = Number(currentEase) || 2.5;

  let nextInterval = 1;
  let formula = '';

  if (grade < 3) {
    nextInterval = 1;
    formula = 'Reset to 1d';
  } else {
    if (rep === 0) {
      nextInterval = 1;
      formula = '1d';
    } else if (rep === 1) {
      nextInterval = 6;
      formula = '6d';
    } else {
      nextInterval = Math.round(interval * ease);
      formula = `${interval}d × ${ease.toFixed(2)}`;
    }
  }

  let nextEase = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  nextEase = Math.max(1.3, nextEase);

  return {
    nextInterval,
    formula,
    nextEase: nextEase.toFixed(2),
    isReset: grade < 3,
  };
}

const QUALITY_CONFIG = [
  {
    grade: 5,
    title: '5 — Perfect',
    subtitle: 'Flawless & clean recall',
    color: 'hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 border-slate-800',
  },
  {
    grade: 4,
    title: '4 — Good',
    subtitle: 'Correct with slight hesitation',
    color: 'hover:border-teal-500 hover:bg-teal-500/10 text-teal-400 border-slate-800',
  },
  {
    grade: 3,
    title: '3 — Hard',
    subtitle: 'Recalled with serious struggle',
    color: 'hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 border-slate-800',
  },
  {
    grade: 2,
    title: '2 — Stumbled',
    subtitle: 'Incorrect; caught own mistake',
    color: 'hover:border-orange-500 hover:bg-orange-500/10 text-orange-400 border-slate-800',
  },
  {
    grade: 1,
    title: '1 — Failed',
    subtitle: 'Wrong; remembered after seeing answer',
    color: 'hover:border-rose-500 hover:bg-rose-500/10 text-rose-400 border-slate-800',
  },
  {
    grade: 0,
    title: '0 — Blackout',
    subtitle: 'Complete blackout / no idea',
    color: 'hover:border-red-600 hover:bg-red-600/10 text-red-500 border-slate-800',
  },
];

export default function ReviewModal({
  isOpen,
  onClose,
  queue = [],
  onReviewSubmit,
}) {
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswerHint, setShowAnswerHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (isOpen && Array.isArray(queue) && queue.length > 0) {
      setSessionQueue(queue);
      setCurrentIndex(0);
      setShowAnswerHint(false);
      setSubmitting(false);
      setLastFeedback(null);
      setCompletedCount(0);
      setErrorText('');
    }
  }, [isOpen]);

  if (!isOpen || sessionQueue.length === 0) return null;

  const isFinished = currentIndex >= sessionQueue.length;
  const currentItem = (!isFinished && sessionQueue[currentIndex]) ? sessionQueue[currentIndex] : {};

  const rawReview = Array.isArray(currentItem?.review_data)
    ? currentItem.review_data[0]
    : (currentItem?.review_data || currentItem || {});

  const problemName = currentItem?.name || currentItem?.problem?.name || `Problem #${currentItem?.problem_id || currentItem?.id || 1}`;
  const difficulty = String(currentItem?.difficulty || currentItem?.problem?.difficulty || 'Medium');
  const topic = String(currentItem?.topic || currentItem?.problem?.topic || 'Algorithms');
  const link = currentItem?.link || currentItem?.problem?.link || '';

  const currentRep = Number(rawReview?.repetition ?? 0);
  const currentInterval = Number(rawReview?.interval_days ?? 1);
  const currentEase = Number(rawReview?.easiness ?? 2.5);
  const cardId = rawReview?.id ?? currentItem?.id;

  const handleGradeSelect = async (grade) => {
    if (!cardId || submitting) return;
    setSubmitting(true);
    setErrorText('');
    try {
      const updatedCard = await onReviewSubmit(cardId, grade);
      setCompletedCount((prev) => prev + 1);

      setLastFeedback({
        grade,
        nextDate: updatedCard?.next_review_date ? String(updatedCard.next_review_date) : 'Scheduled',
        interval: Number(updatedCard?.interval_days ?? 1),
      });

      setTimeout(() => {
        setLastFeedback(null);
        setShowAnswerHint(false);
        setCurrentIndex((prev) => prev + 1);
        setSubmitting(false);
      }, 650);
    } catch (err) {
      console.error('Review error:', err);
      setErrorText(err?.message || 'Failed to submit review');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-bold text-slate-100">SuperMemo-2 Spaced Review</span>
          </div>
          <div className="flex items-center gap-3">
            {!isFinished && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Card {currentIndex + 1} of {sessionQueue.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isFinished ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Review Session Complete!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              You reviewed {completedCount} {completedCount === 1 ? 'problem' : 'problems'} today. Your repetition schedules and ease factors have been updated.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/30"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6">
            {errorText && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {errorText}
              </div>
            )}

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 mb-6 shadow-inner relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {topic}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  difficulty.toLowerCase() === 'easy'
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : difficulty.toLowerCase() === 'medium'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                }`}>
                  {difficulty}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white mb-3">
                {problemName}
              </h2>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-900">
                <span>Repetitions: <strong className="text-slate-200 font-mono">{currentRep}</strong></span>
                <span>Current Interval: <strong className="text-slate-200 font-mono">{currentInterval}d</strong></span>
                <span>Ease Factor: <strong className="text-slate-200 font-mono">{currentEase.toFixed(2)}</strong></span>
                <span className="text-purple-400 font-mono text-[11px] ml-auto">
                  Rule: {currentRep === 0 ? '1d' : currentRep === 1 ? '6d' : `${currentInterval}d × ${currentEase.toFixed(2)}`}
                </span>
              </div>

              {link && (
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    <span>Practice on LeetCode</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setShowAnswerHint(!showAnswerHint)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    {showAnswerHint ? 'Hide Recall Tips' : 'Show Recall Tips'}
                  </button>
                </div>
              )}

              {showAnswerHint && (
                <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-1">
                  <div className="font-semibold text-purple-300">Self-Recall Checklist:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-purple-300/80">
                    <li>Can you state the optimal time & space complexity?</li>
                    <li>What is the core data structure / pattern ({topic})?</li>
                    <li>Did you identify all edge cases without hints?</li>
                  </ul>
                </div>
              )}

              {lastFeedback && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <div className="text-sm font-bold text-white">Score {lastFeedback.grade}/5 Recorded!</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Next review in {lastFeedback.interval} days ({lastFeedback.nextDate})
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Rate Recall Quality (0–5):
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Interval preview: 1d vs 6d vs (I × EF)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {QUALITY_CONFIG.map((opt) => {
                  const preview = calculateNextIntervalPreview(opt.grade, currentRep, currentInterval, currentEase);
                  return (
                    <button
                      key={opt.grade}
                      disabled={submitting}
                      onClick={() => handleGradeSelect(opt.grade)}
                      className={`p-3 rounded-xl border bg-slate-950/70 text-left transition-all group flex flex-col justify-between gap-2 ${opt.color} ${
                        submitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-200 group-hover:text-white">
                            {opt.title}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            preview.isReset
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            Next: {preview.nextInterval}d
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {opt.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono">
                        <span className={preview.isReset ? 'text-rose-400' : 'text-emerald-400 font-medium'}>
                          {preview.formula}
                        </span>
                        <span className="text-slate-500">
                          EF: {preview.nextEase}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
