import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Link2, Tag, BookOpen } from 'lucide-react';

const COMMON_TOPICS = [
  'Array',
  'String',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees & BST',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Bit Manipulation',
  'Trie',
  'Math & Geometry'
];

export default function ProblemModal({ isOpen, onClose, onSave, editingProblem = null, isSaving = false }) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('Array');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProblem) {
      setName(editingProblem.name || '');
      setDifficulty(editingProblem.difficulty || 'Easy');
      setLink(editingProblem.link || '');
      
      const probTopic = editingProblem.topic || 'Array';
      if (COMMON_TOPICS.includes(probTopic)) {
        setTopic(probTopic);
        setIsCustomTopic(false);
      } else {
        setIsCustomTopic(true);
        setCustomTopic(probTopic);
      }
    } else {
      // Defaults for new problem
      setName('');
      setDifficulty('Easy');
      setTopic('Array');
      setCustomTopic('');
      setIsCustomTopic(false);
      setLink('');
    }
    setError('');
  }, [editingProblem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Problem name is required');
      return;
    }

    const finalTopic = isCustomTopic ? customTopic.trim() : topic;
    if (!finalTopic) {
      setError('Topic is required');
      return;
    }

    let finalLink = link.trim();
    if (finalLink && !finalLink.startsWith('http://') && !finalLink.startsWith('https://')) {
      finalLink = `https://${finalLink}`;
    }

    try {
      await onSave({
        name: trimmedName,
        difficulty,
        topic: finalTopic,
        link: finalLink || 'https://leetcode.com',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save problem');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">
              {editingProblem ? 'Edit Problem' : 'Add New Problem'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Problem Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Problem Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Two Sum, Trapping Rain Water"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Difficulty *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Easy', 'Medium', 'Hard'].map((diff) => {
                const isSelected = difficulty.toLowerCase() === diff.toLowerCase();
                let activeStyle = '';
                if (diff === 'Easy') {
                  activeStyle = isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'hover:bg-slate-800';
                } else if (diff === 'Medium') {
                  activeStyle = isSelected ? 'bg-amber-500/20 text-amber-300 border-amber-500' : 'hover:bg-slate-800';
                } else {
                  activeStyle = isSelected ? 'bg-rose-500/20 text-rose-300 border-rose-500' : 'hover:bg-slate-800';
                }

                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected ? activeStyle : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Topic / Category *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTopic(!isCustomTopic)}
                className="text-[11px] text-purple-400 hover:text-purple-300"
              >
                {isCustomTopic ? 'Pick from common' : '+ Custom topic'}
              </button>
            </div>

            {isCustomTopic ? (
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Type custom topic (e.g. Trie, Segment Tree)..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            ) : (
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {COMMON_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              LeetCode Problem URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-all shadow-md shadow-purple-600/30"
            >
              {isSaving ? 'Saving...' : editingProblem ? 'Save Changes' : 'Create Problem'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
