import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Terminal } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export default function SettingsModal({ isOpen, onClose, onRefreshConnection }) {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const saved = setApiBaseUrl(url);
    setUrl(saved);
    if (onRefreshConnection) onRefreshConnection();
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/docs`, { mode: 'no-cors' });
      setTestResult({
        success: true,
        message: `Successfully connected to FastAPI at ${cleanUrl}!`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: `Could not reach ${url}. Make sure FastAPI is running.`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Backend API Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              FastAPI Base URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {testing ? 'Testing...' : 'Test'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Default is usually <code>http://localhost:8000</code> or <code>http://127.0.0.1:8000</code>
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Quick backend startup instructions */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Terminal className="w-3.5 h-3.5" />
              <span>How to run your backend:</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 select-all">
              uvicorn main1:app --reload --port 8000
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
            >
              Save Configuration
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
