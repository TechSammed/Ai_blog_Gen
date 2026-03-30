import React, { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import {
  Search, ArrowRight, Zap, Activity, TrendingUp,
  FileText, LayoutGrid, CheckCircle, AlertCircle,
  Loader2, Check
} from 'lucide-react';

const EXAMPLE_KEYWORDS = [
  'AI blog automation',
  'content marketing tools',
  'SEO optimization India',
  'digital marketing startup',
  'machine learning SaaS',
];

const PIPELINE_NODES = [
  { num: 1, label: 'Keyword Intelligence', desc: 'Expand & score keywords with ROI', icon: Search },
  { num: 2, label: 'SERP Gap Analyzer', desc: 'Content gaps & competitor weaknesses', icon: Activity },
  { num: 3, label: 'Performance Predictor', desc: 'Forecast SEO score & traffic potential', icon: TrendingUp },
  { num: 4, label: 'Blog Generator', desc: 'Generate 3 SEO-optimized blogs', icon: FileText },
  { num: 5, label: 'SEO Validator', desc: 'Score readability, density & AI detection', icon: CheckCircle },
  { num: 6, label: 'Platform Adapter', desc: 'Export to Medium, LinkedIn, WordPress', icon: Zap },
  { num: 7, label: 'Blogy Analysis', desc: 'Dashboard audit & improvement mapping', icon: LayoutGrid },
];

const LOADING_STEP_LABELS = [
  'Keyword Intelligence',
  'SERP Gap Analysis',
  'Performance Prediction',
  'Blog Generation',
  'SEO Validation',
  'Platform Export',
  'Dashboard Analysis',
];

export default function GenerateSection() {
  const { keyword, setKeyword, isLoading, pipelineStep, error, setError, generate, result } = useApp();
  const [inputFocused, setInputFocused] = useState(false);

  const handleGenerate = () => generate(keyword);
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleGenerate(); };

  const canGenerate = keyword?.trim().length > 0 && !isLoading;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-16">

      {/* ─── Hero Section ─── */}
      <div className="flex flex-col items-center text-center pt-16 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border rounded-full bg-zinc-900 border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="text-xs font-medium tracking-wide text-zinc-300">LangGraph + LLaMA 3.1</span>
        </div>

        <h1 className="mb-5 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          AI Blog Intelligence Engine
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
          From keyword to published blog in minutes. A 7-node pipeline featuring keyword analysis, SERP gap detection, and multi-platform export.
        </p>
      </div>

      {/* ─── Input Command Bar (Wrapped in a unified card) ─── */}
      {!isLoading && !error && (
        <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="p-5 sm:p-6 bg-zinc-900/40 border border-white/5 rounded-3xl shadow-lg">

            {/* Clean, ChatGPT-inspired focus state */}
            <div className={`relative flex items-center w-full pl-5 pr-2 py-2 rounded-2xl transition-all duration-300 border ${inputFocused
                ? 'bg-zinc-800 border-zinc-500 shadow-md'
                : 'bg-[#0a0a0c] border-zinc-700 hover:border-zinc-600'
              }`}>
              <Search size={20} className={`shrink-0 transition-colors ${inputFocused ? 'text-zinc-300' : 'text-zinc-500'}`} />
              <input
                id="keyword-input"
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Enter a target keyword (e.g., SEO optimization India)..."
                maxLength={100}
                className="flex-1 w-full px-4 py-3.5 text-base bg-transparent outline-none text-zinc-100 placeholder:text-zinc-500"
              />
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${canGenerate
                    ? 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] shadow-sm'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent'
                  }`}
              >
                Generate <ArrowRight size={16} />
              </button>
            </div>

            {/* Example chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="text-xs font-medium text-zinc-500 mr-1">Suggestions:</span>
              {EXAMPLE_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => setKeyword(kw)}
                  className="px-3 py-1.5 text-xs transition-colors border rounded-md text-zinc-400 border-zinc-800/60 bg-[#0a0a0c] hover:bg-zinc-800 hover:text-zinc-200"
                >
                  {kw}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ─── Error State ─── */}
      {error && (
        <div className="w-full max-w-3xl mx-auto p-6 border rounded-2xl bg-red-950/20 border-red-900/50">
          <div className="flex items-start gap-4">
            <AlertCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Pipeline Execution Failed</h3>
              <p className="mt-1 text-sm text-zinc-400">{error}</p>
              <div className="mt-4 p-3 rounded-lg bg-black/40 border border-red-900/30 text-xs text-zinc-400 font-mono">
                $ python main.py # Ensure blogy_backend is running
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-5 px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                Dismiss & Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Loading State (Monochromatic & Clean) ─── */}
      {isLoading && (
        <div className="w-full max-w-2xl mx-auto p-8 border rounded-3xl bg-zinc-900/40 border-white/5 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700">
              <Loader2 size={20} className="text-zinc-300 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-100">Processing Pipeline</h3>
              <p className="text-sm text-zinc-400">Analyzing "{keyword}" across 7 nodes...</p>
            </div>
          </div>

          <div className="space-y-4">
            {LOADING_STEP_LABELS.map((label, i) => {
              const step = i + 1;
              const isDone = pipelineStep >= step;
              const isCurrent = pipelineStep === step - 1 || (pipelineStep === 0 && step === 1);

              return (
                <div key={label} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors duration-300 ${isDone ? 'bg-zinc-200 text-zinc-900' :
                      isCurrent ? 'border-2 border-zinc-400 text-transparent' : 'border border-zinc-700 text-zinc-600'
                    }`}>
                    {isDone ? <Check size={12} strokeWidth={3} /> :
                      isCurrent ? <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" /> : step}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDone ? 'text-zinc-300' : isCurrent ? 'text-zinc-100' : 'text-zinc-600'
                    }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Success Result Summary ─── */}
      {result && !isLoading && (
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="p-6 border rounded-2xl bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-emerald-500" />
                <div>
                  <h3 className="text-lg font-medium text-zinc-100">Generation Complete</h3>
                  <p className="text-sm text-zinc-400">Target: <span className="text-zinc-200">"{result.keyword_analysis?.primary_keyword || keyword}"</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="ROI Score" value={`${result.keyword_analysis?.keyword_roi_score?.toFixed(0) ?? '—'}%`} />
              <StatCard label="Predicted SEO" value={`${result.prediction?.seo_score_predicted ?? '—'}/100`} />
              <StatCard label="Est. Traffic" value={result.prediction?.estimated_monthly_traffic?.toLocaleString() ?? '—'} />
              <StatCard label="Blogs Generated" value={result.blogs?.length ?? '—'} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Pipeline Node Grid ─── */}
      {!isLoading && (
        <div className="w-full max-w-5xl mx-auto pt-8">
          <h2 className="mb-6 text-sm font-medium tracking-wide uppercase text-zinc-500">Architecture</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_NODES.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.num} className="p-5 transition-colors border rounded-xl bg-zinc-900/30 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/80">
                  <Icon size={20} className="mb-4 text-zinc-400" />
                  <div className="mb-1 text-sm font-medium text-zinc-200">{node.label}</div>
                  <div className="text-xs leading-relaxed text-zinc-500">{node.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimalist Stat Card Sub-component
function StatCard({ label, value }) {
  return (
    <div className="p-4 border rounded-xl bg-zinc-950/50 border-zinc-800/60">
      <div className="mb-1 text-xs font-medium text-zinc-500">{label}</div>
      <div className="text-xl font-semibold tracking-tight text-zinc-100">{value}</div>
    </div>
  );
}