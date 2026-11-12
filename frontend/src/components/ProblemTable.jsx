import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Filter, 
  Tag, 
  ArrowUpDown,
  BookOpen
} from 'lucide-react';

export default function ProblemTable({ 
  problems = [], 
  dueCards = [],
  onAddProblem, 
  onEditProblem, 
  onDeleteProblem, 
  onReviewProblem,
  onStartReviewSession
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Extract unique topics from problems
  const uniqueTopics = useMemo(() => {
    const set = new Set();
    problems.forEach(p => {
      if (p.topic) set.add(p.topic.trim());
    });
    return Array.from(set).sort();
  }, [problems]);

  // Today's ISO date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Map of due card problem_ids
  const dueProblemIds = useMemo(() => {
    return new Set(dueCards.map(c => c.problem_id));
  }, [dueCards]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Search text
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.topic && p.topic.toLowerCase().includes(searchTerm.toLowerCase()));

      // Difficulty
      const matchesDiff = 
        selectedDifficulty === 'ALL' || 
        p.difficulty?.toUpperCase() === selectedDifficulty.toUpperCase();

      // Topic
      const matchesTopic = 
        selectedTopic === 'ALL' || 
        p.topic === selectedTopic;

      // Status
      let matchesStatus = true;
      const isDue = dueProblemIds.has(p.id) || (p.review_data && p.review_data.next_review_date <= todayStr);
      const rep = p.review_data?.repetition || 0;
      const interval = p.review_data?.interval_days || 1;

      if (selectedStatus === 'DUE') {
        matchesStatus = isDue;
      } else if (selectedStatus === 'UPCOMING') {
        matchesStatus = !isDue;
      } else if (selectedStatus === 'NEEDS_PRACTICE') {
        matchesStatus = !p.review_data || rep === 0 || interval <= 1;
      } else if (selectedStatus === 'LEARNING') {
        matchesStatus = p.review_data && rep > 0 && interval < 21 && rep < 3;
      } else if (selectedStatus === 'MASTERED') {
        matchesStatus = p.review_data && (interval >= 21 || rep >= 3);
      }

      return matchesSearch && matchesDiff && matchesTopic && matchesStatus;
    });
  }, [problems, searchTerm, selectedDifficulty, selectedTopic, selectedStatus, dueProblemIds, todayStr]);

  const getDifficultyBadge = (difficulty) => {
    const diff = (difficulty || '').toLowerCase();
    if (diff === 'easy') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Easy
        </span>
      );
    }
    if (diff === 'medium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Hard
      </span>
    );
  };

  const getMasteryBadge = (reviewData) => {
    if (!reviewData) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Needs Practice
        </span>
      );
    }

    const { repetition = 0, interval_days = 1 } = reviewData;

    // Mastered: interval_days >= 21 or repetition >= 3
    if (interval_days >= 21 || repetition >= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Mastered
        </span>
      );
    }

    // Needs Practice: repetition 0 or interval <= 1
    if (repetition === 0 || interval_days <= 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Needs Practice
        </span>
      );
    }

    // Learning: repetition 1-2, interval < 21
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Learning
      </span>
    );
  };

  const getReviewStatusBadge = (reviewData, problemId) => {
    if (!reviewData) {
      return <span className="text-xs text-slate-500">No review data</span>;
    }

    const isDue = dueProblemIds.has(problemId) || reviewData.next_review_date <= todayStr;

    if (isDue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
          <Clock className="w-3 h-3" />
          <span>Due Today</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        <span>Due {reviewData.next_review_date}</span>
      </span>
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problem name or topic..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Topic Filter */}
          {uniqueTopics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-purple-500 max-w-[150px] truncate"
            >
              <option value="ALL">All Topics</option>
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Status</option>
            <option value="DUE">Due Today</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="NEEDS_PRACTICE">Needs Practice</option>
            <option value="LEARNING">Learning</option>
            <option value="MASTERED">Mastered</option>
          </select>

          {/* Start Review Queue Button */}
          {dueCards.length > 0 && (
            <button
              onClick={onStartReviewSession}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Review Queue ({dueCards.length})</span>
            </button>
          )}

          {/* Add Problem Button */}
          <button
            onClick={onAddProblem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Problem</span>
          </button>

        </div>
      </div>

      {/* Problems Table */}
      {filteredProblems.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No problems found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {problems.length === 0 
              ? "You haven't added any problems yet. Click the button below to add your first LeetCode problem."
              : "No problems match your current search and filter criteria."}
          </p>
          {problems.length === 0 && (
            <button
              onClick={onAddProblem}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Problem</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Problem</th>
                <th className="pb-3 px-3">Difficulty</th>
                <th className="pb-3 px-3">Topic</th>
                <th className="pb-3 px-3">SM-2 Spaced Schedule</th>
                <th className="pb-3 px-3">Mastery & SM-2</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredProblems.map((problem) => {
                const rd = problem.review_data;
                const isDue = dueProblemIds.has(problem.id) || (rd && rd.next_review_date <= todayStr);

                return (
                  <tr key={problem.id} className="hover:bg-slate-800/30 transition-colors group">
                    
                    {/* Name & Link */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                          {problem.name}
                        </span>
                        {problem.link && (
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-purple-400 transition-colors"
                            title="Open problem on LeetCode"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-3">
                      {getDifficultyBadge(problem.difficulty)}
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {problem.topic || 'General'}
                      </span>
                    </td>

                    {/* Spaced Schedule */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        {getReviewStatusBadge(rd, problem.id)}
                        {rd && (
                          <span className="text-[11px] text-slate-400">
                            (Interval: {rd.interval_days}d)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* SM-2 Mastery */}
                    <td className="py-3.5 px-3">
                      {rd ? (
                        <div className="flex flex-col gap-1 items-start">
                          {getMasteryBadge(rd)}
                          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                            <span className="text-slate-300 font-medium">Rep {rd.repetition}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">EF {rd.easiness.toFixed(2)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Needs Practice
                          </span>
                          <span className="text-xs text-slate-500 font-mono">Rep 0 · EF 2.50</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Labeled Review Button */}
                        {rd && (
                          <button
                            onClick={() => onReviewProblem(problem)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isDue
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-sm shadow-amber-500/10'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                            }`}
                            title="Open 0–5 Recall Review Modal"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => onEditProblem(problem)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Edit Problem"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteProblem(problem)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer problem count */}
      {filteredProblems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProblems.length} of {problems.length} problems</span>
          <span>Spaced Repetition powered by SuperMemo-2</span>
        </div>
      )}

    </div>
  );
}
