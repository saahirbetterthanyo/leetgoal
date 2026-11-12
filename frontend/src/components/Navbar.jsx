import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  LogOut, 
  User, 
  Server, 
  Settings, 
  LogIn, 
  AlertCircle,
  Clock
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onLogout, 
  onOpenAuth, 
  onOpenSettings, 
  dueCount = 0, 
  onOpenReview,
  serverStatus = 'connected' 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                LeetGoal
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                SM-2 Spaced Repetition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">FastAPI & LeetCode Recall Tracker</p>
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          
          {/* Due Review Notification Button */}
          {user && dueCount > 0 && (
            <button
              onClick={onOpenReview}
              className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-sm animate-pulse"
              title="You have cards due for spaced review today!"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{dueCount} Due for Review</span>
            </button>
          )}

          {/* Backend Health Badge */}
          <button
            onClick={onOpenSettings}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              serverStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
            }`}
            title="Click to configure backend API URL"
          >
            <span className={`w-2 h-2 rounded-full ${
              serverStatus === 'connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-400'
            }`} />
            <span className="hidden md:inline">
              {serverStatus === 'connected' ? 'Backend Online' : 'Backend Disconnected'}
            </span>
            <Settings className="w-3.5 h-3.5 ml-0.5 text-slate-400 hover:text-white" />
          </button>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden sm:inline">
                  @{user.username}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-600/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
