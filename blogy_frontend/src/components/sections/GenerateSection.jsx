import { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import {
  Search, ArrowRight, Zap, Activity, TrendingUp,
  FileText, LayoutGrid, CheckCircle, ChevronRight, AlertCircle,
  Loader2
} from 'lucide-react';

const EXAMPLE_KEYWORDS = [
  'AI blog automation',
  'content marketing tools',
  'SEO optimization India',
  'digital marketing startup',
  'machine learning SaaS',
];

const PIPELINE_NODES = [
  { num: 1, label: 'Keyword Intelligence', desc: 'Expand & score keywords with ROI', color: 'from-violet-500 to-purple-600', icon: Search },
  { num: 2, label: 'SERP Gap Analyzer', desc: 'Content gaps & competitor weaknesses', color: 'from-blue-500 to-indigo-600', icon: Activity },
  { num: 3, label: 'Performance Predictor', desc: 'Forecast SEO score & traffic potential', color: 'from-emerald-500 to-green-600', icon: TrendingUp },
  { num: 4, label: 'Blog Generator', desc: 'Generate 3 SEO-optimized blogs in parallel', color: 'from-orange-500 to-amber-600', icon: FileText },
  { num: 5, label: 'SEO Validator', desc: 'Score readability, density & AI detection', color: 'from-pink-500 to-rose-600', icon: CheckCircle },
  { num: 6, label: 'Platform Adapter', desc: 'Export to Medium, LinkedIn, WordPress…', color: 'from-teal-500 to-cyan-600', icon: Zap },
  { num: 7, label: 'Blogy Analysis', desc: 'Dashboard audit & improvement mapping', color: 'from-indigo-500 to-violet-600', icon: LayoutGrid },
];

const LOADING_STEP_LABELS = [
  'Keyword Intelligence',
  'SERP Gap Analysis',
  'Performance Prediction',
  'Blog Generation (→ 3 blogs)',
  'SEO Validation',
  'Platform Export',
  'Dashboard Analysis',
];

export default function GenerateSection() {
  const { keyword, setKeyword, isLoading, pipelineStep, error, setError, generate, result, setActiveSection } = useApp();
  const [inputFocused, setInputFocused] = useState(false);

  const handleGenerate = () => generate(keyword);
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleGenerate(); };

  const canGenerate = keyword.trim().length > 0 && !isLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Hero ─── */}
      <div className="text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-violet-300 text-xs font-medium">Powered by LangGraph + Groq LLaMA 3.1</span>
        </div>

        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          AI Blog Intelligence<br />
          <span className="gradient-text">Engine</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          From keyword to published blog in minutes.
          <span className="text-slate-300"> 7-node LangGraph pipeline</span> with keyword analysis,
          SERP gap detection, performance prediction + multi-platform export.
        </p>
      </div>

      {/* ─── Input Card ─── */}
      {!isLoading && !error && (
        <div className="glass-card rounded-2xl p-6 glow-purple animate-slide-up">
          <h2 className="text-white font-semibold text-lg mb-1">Generate Your Blog</h2>
          <p className="text-slate-500 text-sm mb-5">Enter a target keyword and run the full AI pipeline.</p>

          {/* Input row */}
          <div className="flex gap-3">
            <div className={`flex-1 flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all duration-200
              ${inputFocused ? 'border-violet-500/50 bg-white/[0.06] shadow-lg shadow-violet-500/10' : 'border-white/[0.08] hover:border-white/[0.12]'}`}>
              <Search size={16} className={`shrink-0 transition-colors ${inputFocused ? 'text-violet-400' : 'text-slate-500'}`} />
              <input
                id="keyword-input"
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="e.g. AI blog automation, content marketing India…"
                maxLength={100}
                className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
              />
              <span className="text-slate-600 text-xs shrink-0">{keyword.length}/100</span>
            </div>

            <button
              id="generate-btn"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${canGenerate
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-white/[0.05] text-slate-600 cursor-not-allowed'
                }`}
            >
              <ArrowRight size={16} />
              Generate
            </button>
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-slate-600 text-xs">Try:</span>
            {EXAMPLE_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => setKeyword(kw)}
                className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400
                  hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/10 transition-all duration-200"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Error State ─── */}
      {error && (
        <div className="glass-card rounded-2xl p-6 border border-red-500/20 bg-red-500/5 animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-1">Pipeline Error</h3>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <p className="text-slate-500 text-xs mb-4">💡 Make sure the backend is running: <code className="bg-white/[0.06] px-2 py-0.5 rounded text-slate-300">python main.py</code> in the <code className="bg-white/[0.06] px-2 py-0.5 rounded text-slate-300">blogy_backend</code> directory.</p>
              <button
                onClick={() => { setError(null); }}
                className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm rounded-lg border border-white/[0.08] transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Loading State ─── */}
      {isLoading && (
        <div className="glass-card rounded-2xl p-8 animate-scale-in">
          {/* Animated orb */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-40 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Running AI Pipeline…</h3>
            <p className="text-slate-400 text-sm">Processing <span className="text-violet-300 font-medium">"{keyword}"</span> through 7 intelligent nodes</p>
            <p className="text-slate-600 text-xs mt-1">This may take 1-3 minutes. Blog quality takes time! ☕</p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOADING_STEP_LABELS.map((label, i) => {
              const step = i + 1;
              const isDone = pipelineStep >= step;
              const isCurrent = pipelineStep === step - 1 || (pipelineStep === 0 && step === 1);
              return (
                <div key={label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500
                    ${isDone ? 'bg-emerald-500/10 border-emerald-500/25' : isCurrent ? 'bg-violet-500/10 border-violet-500/25' : 'bg-white/[0.02] border-white/[0.06]'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all
                    ${isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-violet-500 text-white' : 'bg-white/[0.06] text-slate-500'}`}
                  >
                    {isDone ? '✓' : isCurrent ? <Loader2 size={12} className="animate-spin" /> : step}
                  </div>
                  <span className={`text-sm font-medium ${isDone ? 'text-emerald-300' : isCurrent ? 'text-violet-300' : 'text-slate-500'}`}>
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
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 animate-scale-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Pipeline Complete!</h3>
              <p className="text-slate-400 text-sm">Generated for: <span className="text-violet-300 font-medium">"{result.keyword_analysis?.primary_keyword || keyword}"</span></p>
            </div>
            <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium
              ${result.status === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              {result.status === 'success' ? '✓ Full Success' : '⚡ Partial Success'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatChip label="ROI Score" value={`${result.keyword_analysis?.keyword_roi_score?.toFixed(0) ?? '—'}%`} color="violet" />
            <StatChip label="SEO Predicted" value={`${result.prediction?.seo_score_predicted ?? '—'}/100`} color="blue" />
            <StatChip label="Monthly Traffic" value={result.prediction?.estimated_monthly_traffic?.toLocaleString() ?? '—'} color="emerald" />
            <StatChip label="Blogs Generated" value={result.blogs?.length ?? '—'} color="orange" />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { section: 'keywords', label: '🔍 View Keywords' },
              { section: 'serp', label: '📊 SERP Gap' },
              { section: 'prediction', label: '📈 Performance' },
              { section: 'blogs', label: '✍️ Read Blogs' },
              { section: 'blogy', label: '🧩 Dashboard Analysis' },
            ].map(({ section, label }) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white rounded-lg transition-all duration-200"
              >
                {label} <ChevronRight size={12} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Pipeline Node Cards ─── */}
      {!isLoading && (
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">7-Node AI Pipeline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {PIPELINE_NODES.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.num}
                  className="glass-card rounded-xl p-4 hover:bg-white/[0.05] transition-all duration-200 group cursor-default"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Node {node.num}</div>
                  <div className="text-white text-sm font-semibold mb-1 leading-tight">{node.label}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{node.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, color }) {
  const colors = {
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/25 text-violet-300',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/25 text-blue-300',
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/25 text-emerald-300',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/25 text-orange-300',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-3 text-center`}>
      <div className={`text-xl font-bold mb-0.5`}>{value}</div>
      <div className="text-slate-400 text-[11px]">{label}</div>
    </div>
  );
}
