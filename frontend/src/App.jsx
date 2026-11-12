import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import ProblemTable from './components/ProblemTable';
import ProblemModal from './components/ProblemModal';
import ReviewModal from './components/ReviewModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import api, { getToken } from './services/api';
import { 
  Sparkles, 
  Brain, 
  Layers, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw,
  AlertCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [serverStatus, setServerStatus] = useState('connected');

  // Data states
  const [problems, setProblems] = useState([]);
  const [dueCards, setDueCards] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Check auth and initial user
  const initAuth = useCallback(async () => {
    setLoadingUser(true);
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      setServerStatus('connected');
    } catch (err) {
      console.warn('Could not validate token or reach server:', err);
      if (err.status === 401) {
        api.logout();
        setUser(null);
      } else {
        setServerStatus('disconnected');
      }
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Fetch problems and due cards
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setErrorMsg('');
    try {
      const [probList, dueList] = await Promise.all([
        api.getProblems(),
        api.getDueCards(),
      ]);
      setProblems(probList || []);
      setDueCards(dueList || []);
      setServerStatus('connected');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMsg(err.message || 'Failed to load data from backend');
      setServerStatus('disconnected');
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setProblems([]);
      setDueCards([]);
    }
  }, [user, loadDashboardData]);

  // Auth actions
  const handleLogin = async (username, password) => {
    await api.login(username, password);
    const currentUser = await api.getCurrentUser();
    setUser(currentUser);
  };

  const handleRegister = async (username, password) => {
    await api.register(username, password);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setProblems([]);
    setDueCards([]);
  };

  // Problem actions
  const handleSaveProblem = async (problemData) => {
    if (editingProblem) {
      await api.updateProblem(editingProblem.id, problemData);
    } else {
      await api.createProblem(problemData);
    }
    await loadDashboardData();
  };

  const handleDeleteProblem = async (problem) => {
    if (!window.confirm(`Are you sure you want to delete "${problem.name}"?`)) {
      return;
    }
    try {
      await api.deleteProblem(problem.id);
      await loadDashboardData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Single review
  const handleReviewProblem = (problem) => {
    if (!problem.review_data) return;
    setReviewQueue([problem]);
    setReviewModalOpen(true);
  };

  // Review queue session for all due cards
  const handleStartReviewSession = () => {
    // Map due cards to corresponding problems for rich display
    const queue = dueCards.map(dueCard => {
      const matchedProblem = problems.find(p => p.id === dueCard.problem_id);
      return matchedProblem ? {
        ...matchedProblem,
        review_data: dueCard,
      } : dueCard;
    });

    if (queue.length > 0) {
      setReviewQueue(queue);
      setReviewModalOpen(true);
    }
  };

  // Review submission
  const handleReviewSubmit = async (cardId, quality) => {
    const updated = await api.reviewCard(cardId, quality);
    await loadDashboardData();
    return updated;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        dueCount={dueCards.length}
        onOpenReview={handleStartReviewSession}
        serverStatus={serverStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner if disconnected */}
        {serverStatus === 'disconnected' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Backend server is unreachable on <strong>{api.getApiBaseUrl ? api.getApiBaseUrl() : 'http://localhost:8000'}</strong>. Make sure your FastAPI backend is running!
              </span>
            </div>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shrink-0"
            >
              Configure URL
            </button>
          </div>
        )}

        {/* Loading User Check */}
        {loadingUser ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-purple-400 animate-spin mb-4" />
            <p className="text-sm text-slate-400">Connecting to LeetGoal backend...</p>
          </div>
        ) : user ? (
          /* Authenticated Dashboard View */
          <div>
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Welcome back, {user.username}</span>
                  <span className="text-sm font-normal text-slate-400 hidden sm:inline">👋</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Optimize your coding interview retention with the SM-2 algorithm.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadDashboardData}
                  disabled={loadingData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Refresh data from server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={loadDashboardData} className="underline font-semibold ml-2">
                  Retry
                </button>
              </div>
            )}

            {/* Prominent Due Today Review Queue Banner */}
            <div className={`mb-6 p-5 sm:p-6 rounded-2xl border transition-all ${
              dueCards.length > 0
                ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5'
                : 'bg-slate-900/60 border-slate-800/80 shadow-md'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    dueCards.length > 0 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {dueCards.length > 0 ? (
                      <Clock className="w-6 h-6 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        Due Today — Review Queue
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        dueCards.length > 0 
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {dueCards.length > 0 ? `${dueCards.length} Due` : 'Caught Up'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {dueCards.length > 0
                        ? `You have ${dueCards.length} problem${dueCards.length === 1 ? '' : 's'} scheduled for spaced repetition review today. Strengthening your recall curve before memory fades.`
                        : "You're completely caught up! No problems are due for revision right now. Add new problems or solve more to expand your recall queue."}
                    </p>
                  </div>
                </div>

                {dueCards.length > 0 && (
                  <button
                    onClick={handleStartReviewSession}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/20 shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Start Review Queue ({dueCards.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Compact 3-Step 'How SM-2 Works' Explainer Strip */}
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    How SM-2 Spaced Repetition Works
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">SuperMemo-2 Protocol</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Solve & Rate (0–5)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Solve on LeetCode, then grade your recall quality: 0 (blackout) to 5 (flawless).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Dynamic Intervals</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      1d → 6d → interval × EF. Ratings below 3 reset schedule back to 1 day.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Permanent Retention</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Repetitions build permanent mastery (21d+ intervals) without burnout.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Stats Overview Cards */}
            <StatsCards
              problems={problems}
              dueCards={dueCards}
              onStartReview={handleStartReviewSession}
            />

            {/* Problems Explorer Table & Filter */}
            <ProblemTable
              problems={problems}
              dueCards={dueCards}
              onAddProblem={() => {
                setEditingProblem(null);
                setProblemModalOpen(true);
              }}
              onEditProblem={(prob) => {
                setEditingProblem(prob);
                setProblemModalOpen(true);
              }}
              onDeleteProblem={handleDeleteProblem}
              onReviewProblem={handleReviewProblem}
              onStartReviewSession={handleStartReviewSession}
            />

          </div>
        ) : (
          /* Unauthenticated Landing / Showcase View */
          <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Never Forget a LeetCode Pattern Again</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Master Coding Interviews with{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Spaced Repetition
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              LeetGoal pairs your LeetCode practice with the SuperMemo-2 (SM-2) algorithm. Solve once, review at mathematically optimal intervals, and retain problem-solving patterns forever.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-xl shadow-purple-600/30"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In to Account
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">SM-2 Spaced Algorithm</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculates optimal repetition intervals based on your recall quality score (0 to 5) so you review at the verge of forgetting.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Structured Categorization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Filter by difficulty (Easy, Med, Hard) and key patterns: Sliding Window, Trees, Graphs, Two Pointers, and Dynamic Programming.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Due Cards Queue</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatic daily review queues prompt you when problems need recall testing, keeping your cognitive load low.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LeetGoal • Built with FastAPI, SQLite & SuperMemo-2 Spaced Repetition</span>
          <span>FastAPI Backend connected via JWT & OAuth2 Bearer</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <ProblemModal
        isOpen={problemModalOpen}
        onClose={() => {
          setProblemModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleSaveProblem}
        editingProblem={editingProblem}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewQueue([]);
        }}
        queue={reviewQueue}
        onReviewSubmit={handleReviewSubmit}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onRefreshConnection={() => {
          initAuth();
          loadDashboardData();
        }}
      />

    </div>
  );
}
