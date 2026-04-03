import React, { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import {
  Search, ArrowRight, Zap, Activity, TrendingUp,
  FileText, LayoutGrid, CheckCircle, AlertCircle,
  Loader2, Check, Sparkles
} from 'lucide-react';

const EXAMPLE_KEYWORDS = [
  'AI blog automation',
  'Content marketing tools',
  'SEO optimization India',
  'Digital marketing startup',
  'Machine learning SaaS',
];

const PIPELINE_NODES = [
  { num: 1, label: 'Keyword Intelligence', desc: 'Expand & score keywords with return on investment metrics.', icon: Search },
  { num: 2, label: 'SERP Gap Analyzer', desc: 'Identify content gaps & competitor weaknesses to target.', icon: Activity },
  { num: 3, label: 'Performance Predictor', desc: 'Forecast SEO score & future organic traffic potential.', icon: TrendingUp },
  { num: 4, label: 'Blog Generator', desc: 'Generate high-quality, beautifully written articles.', icon: FileText },
  { num: 5, label: 'SEO Validator', desc: 'Score readability, density & ensure a humanized tone.', icon: CheckCircle },
  { num: 6, label: 'Platform Adapter', desc: 'Export beautifully formatted content directly to platforms.', icon: Zap },
  { num: 7, label: 'Comprehensive Audit', desc: 'Map improvements and track metrics seamlessly.', icon: LayoutGrid },
];

const LOADING_STEP_LABELS = [
  'Refining Keyword Strategy',
  'Analyzing Competitor Gaps',
  'Forecasting Performance',
  'Crafting Articles',
  'Validating SEO & Readability',
  'Adapting for Platforms',
  'Finalizing Audit Dashboard',
];

export default function GenerateSection() {
  const { keyword, setKeyword, isLoading, pipelineStep, error, setError, generate, result } = useApp();
  const [inputFocused, setInputFocused] = useState(false);

  const handleGenerate = () => generate(keyword);
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleGenerate(); };

  const canGenerate = keyword?.trim().length > 0 && !isLoading;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-24 px-4 sm:px-6">

      {/* ─── Hero Section ─── */}
      <div className="flex flex-col items-center text-center pt-20 pb-8 sm:pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border rounded-full bg-indigo-500/10 border-indigo-500/20 backdrop-blur-md transition-colors hover:bg-indigo-500/20">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">Powered by cutting-edge intelligence</span>
        </div>

        <h1 className="max-w-4xl mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Content Strategy, <span className="gradient-text">Simplified.</span>
        </h1>

        <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl text-slate-400">
          Transform a simple topic into a comprehensive, published article. Elevate your presence with optimized content crafted in minutes.
        </p>
      </div>

      {/* ─── Input Command Bar ─── */}
      {!isLoading && !error && (
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className={`relative flex items-center w-full p-2.5 sm:p-3 glass-card rounded-full transition-all duration-500 shadow-2xl ${
            inputFocused ? 'border-indigo-500/50 ring-4 ring-indigo-500/20 shadow-[0_0_40px_rgba(129,140,248,0.15)]' : 'hover:border-indigo-500/30 shadow-black/40'
            }`}>
            <div className="pl-5 pr-3 sm:pl-8 sm:pr-4">
              <Search size={26} strokeWidth={2.5} className={`transition-colors duration-300 ${inputFocused ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <input
              id="keyword-input"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="What topic do you want to conquer next?"
              maxLength={100}
              className="flex-1 w-full py-4 sm:py-5 text-lg sm:text-xl font-medium bg-transparent outline-none text-white placeholder:text-slate-500 tracking-wide"
            />
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shrink-0 ${canGenerate
                ? 'bg-indigo-500 text-white hover:bg-indigo-400 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(129,140,248,0.4)]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
            >
              <span className="hidden sm:inline">Start Analysis</span>
              <span className="inline sm:hidden">Start</span>
              <ArrowRight size={20} strokeWidth={2.5} className={canGenerate ? 'text-white' : 'text-slate-500'} />
            </button>
          </div>

          {/* Friendly Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
            <span className="text-sm font-medium text-zinc-500 mr-1 sm:mr-2">Try starting with:</span>
            {EXAMPLE_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => setKeyword(kw)}
                className="px-4 py-2 text-xs sm:text-sm transition-all border rounded-full text-zinc-400 border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
              >
                {kw}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* ─── Error State ─── */}
      {error && (
        <div className="w-full max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 sm:p-8 border rounded-3xl bg-red-950/10 border-red-900/30 flex flex-col sm:flex-row items-start gap-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-900/20 shrink-0">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-semibold text-red-400">Ah, we hit a snag</h3>
              <p className="mt-2 text-base text-zinc-400">{error}</p>
              <div className="mt-5 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 text-sm text-zinc-300 font-mono flex items-center gap-3 overflow-x-auto">
                <span className="text-zinc-600 select-none">$</span>
                <span className="whitespace-nowrap">python main.py <span className="text-zinc-500 italic ml-2"># Ensure backend is running</span></span>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-6 px-6 py-3 text-sm font-medium transition-colors border rounded-full text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                Dismiss Module & Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Loading State ─── */}
      {isLoading && (
        <div className="w-full max-w-2xl mx-auto p-8 sm:p-12 glass-card rounded-[2rem] sm:rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 glow-purple">
              <Loader2 size={28} className="text-indigo-400 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Architecting Content</h3>
            <p className="text-base text-slate-400">Crafting strategy for <span className="text-white font-medium whitespace-nowrap">"{keyword}"</span></p>
          </div>

          <div className="space-y-6 max-w-sm mx-auto relative z-10">
            {LOADING_STEP_LABELS.map((label, i) => {
              const step = i + 1;
              const isDone = pipelineStep >= step;
              const isCurrent = pipelineStep === step - 1 || (pipelineStep === 0 && step === 1);

              return (
                <div key={label} className="flex items-center gap-5">
                  <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full transition-all duration-500 ${
                    isDone ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(129,140,248,0.5)] scale-100' :
                    isCurrent ? 'bg-indigo-500/20 border-2 border-indigo-500/50 text-indigo-300 scale-110' : 'bg-white/5 border border-white/10 text-slate-500 scale-100'
                    }`}>
                    {isDone ? <Check size={16} strokeWidth={3} /> :
                      isCurrent ? <Sparkles size={14} className="animate-pulse text-indigo-400" /> : <span className="text-xs font-semibold">{step}</span>}
                  </div>
                  <span className={`text-base font-semibold transition-colors duration-300 ${
                    isDone ? 'text-slate-200' : isCurrent ? 'text-white' : 'text-slate-500'
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
        <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-8 sm:p-10 glass-card rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-8 border-b border-white/10 gap-6">
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 glow-purple">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Analysis Complete</h3>
                  <p className="text-base text-slate-400">Target Strategy: <span className="text-white font-medium">"{result.keyword_analysis?.primary_keyword || keyword}"</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 xs:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Return on Investment" value={`${result.keyword_analysis?.keyword_roi_score?.toFixed(0) ?? '—'}%`} />
              <StatCard label="Predicted SEO Score" value={`${result.prediction?.seo_score_predicted ?? '—'}/100`} />
              <StatCard label="Monthly Traffic Est." value={result.prediction?.estimated_monthly_traffic?.toLocaleString() ?? '—'} />
              <StatCard label="Content Assets" value={result.blogs?.length ?? '—'} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Architecture Grid ─── */}
      {!isLoading && (
        <div className="w-full max-w-5xl mx-auto pt-16 sm:pt-24 mb-16 relative z-10">
          <div className="flex flex-col items-center mb-12 text-center px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How the <span className="gradient-text">magic happens</span></h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              Our intelligent pipeline processes your topic through specialized modules to ensure comprehensive analysis and high-quality generation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PIPELINE_NODES.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.num} className="flex flex-col p-6 transition-all duration-300 glass-card rounded-[1.5rem] hover:bg-white/[0.03] hover:border-indigo-500/30 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-white/5 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(129,140,248,0.4)] transition-all duration-300">
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{node.label}</h4>
                  <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// Elegant Stat Card Sub-component
function StatCard({ label, value }) {
  return (
    <div className="flex flex-col p-6 rounded-[1.25rem] bg-black/20 border border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="mb-2 text-sm font-semibold text-slate-400 relative z-10">{label}</div>
      <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white relative z-10">{value}</div>
    </div>
  );
}
