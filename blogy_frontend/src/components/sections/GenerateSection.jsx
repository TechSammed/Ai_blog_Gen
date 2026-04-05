import React, { useMemo, useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import {
  Search,
  ArrowRight,
  Activity,
  TrendingUp,
  FileText,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  Clock3,
  Compass,
  Sparkle,
} from 'lucide-react';

const EXAMPLE_KEYWORDS = [
  'AI blog automation',
  'Content marketing tools',
  'SEO optimization India',
  'Digital marketing startup',
  'Machine learning SaaS',
];

const PIPELINE_NODES = [
  { num: 1, label: 'Keyword Intelligence', desc: 'Expand and score keywords by ROI and intent.', icon: Search },
  { num: 2, label: 'SERP Gap Analyzer', desc: 'Identify missing angles in top ranking pages.', icon: Activity },
  { num: 3, label: 'Performance Predictor', desc: 'Forecast ranking window and traffic potential.', icon: TrendingUp },
  { num: 4, label: 'Blog Generator', desc: 'Draft structured blog posts for target keywords.', icon: FileText },
  { num: 5, label: 'SEO Validator', desc: 'Check readability, density, and score quality.', icon: CheckCircle },
  { num: 6, label: 'Platform Adapter', desc: 'Prepare exports for publishing destinations.', icon: Compass },
  { num: 7, label: 'Dashboard Analysis', desc: 'Map risks, opportunities, and next actions.', icon: LayoutGrid },
];

const LOADING_STEPS = [
  { label: 'Keyword strategy setup', helper: 'Finding intent and high-value variations' },
  { label: 'SERP gap scan', helper: 'Comparing your angle against competitors' },
  { label: 'Performance forecast', helper: 'Estimating traffic and ranking difficulty' },
  { label: 'Blog drafting', helper: 'Generating content structure and sections' },
  { label: 'SEO quality pass', helper: 'Validating score, readability, and balance' },
  { label: 'Publishing formats', helper: 'Adapting output for each destination' },
  { label: 'Dashboard summary', helper: 'Assembling insight panels and priorities' },
];

export default function GenerateSection() {
  const {
    keyword,
    setKeyword,
    isLoading,
    pipelineStep,
    error,
    setError,
    generate,
    result,
    setActiveSection,
  } = useApp();

  const [inputFocused, setInputFocused] = useState(false);

  const handleGenerate = () => generate(keyword);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleGenerate();
  };

  const canGenerate = keyword?.trim().length > 0 && !isLoading;

  const currentStep = useMemo(() => {
    if (pipelineStep <= 0) return 1;
    if (pipelineStep >= 7) return 7;
    return pipelineStep;
  }, [pipelineStep]);

  const progress = Math.round((currentStep / LOADING_STEPS.length) * 100);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-20 sm:px-6">
      <section className="rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.02] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            <Sparkle size={12} />
            Generate Blog
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Build SEO-ready blogs with a cleaner workflow
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            Enter one topic, run the seven-step pipeline, and review a complete result set with analysis,
            performance prediction, and publishing-ready content.
          </p>
        </div>
      </section>

      {!isLoading && (
        <section className="rounded-3xl border border-white/10 bg-[#0f1117] p-5 sm:p-6">
          <label htmlFor="keyword-input" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Target keyword
          </label>

          <div
            className={`mt-3 flex flex-col gap-3 rounded-2xl border bg-black/20 p-2 sm:flex-row sm:items-center ${
              inputFocused ? 'border-slate-300/40' : 'border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 px-3 text-slate-400">
              <Search size={18} />
              <span className="text-xs uppercase tracking-[0.12em]">Input</span>
            </div>

            <input
              id="keyword-input"
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Example: AI content automation for SaaS"
              maxLength={100}
              className="h-11 flex-1 rounded-xl bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors ${
                canGenerate
                  ? 'bg-slate-200 text-slate-900 hover:bg-white'
                  : 'bg-white/8 text-slate-500 cursor-not-allowed'
              }`}
            >
              Generate
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Try:</span>
            {EXAMPLE_KEYWORDS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setKeyword(sample)}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                {sample}
              </button>
            ))}
          </div>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 text-rose-300" />
            <div>
              <h3 className="text-base font-semibold text-rose-100">Generation failed</h3>
              <p className="mt-1 text-sm text-rose-200/80">{error}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="rounded-lg border border-rose-200/20 bg-black/20 px-3 py-1.5 text-xs text-rose-100 hover:bg-black/30"
                >
                  Dismiss
                </button>
                <code className="rounded-lg border border-rose-200/20 bg-black/20 px-3 py-1.5 text-xs text-rose-100">
                  python main.py
                </code>
              </div>
            </div>
          </div>
        </section>
      )}

      {isLoading && (
        <section className="rounded-3xl border border-white/10 bg-[#0f1117] p-6 sm:p-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Pipeline Progress</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Building content for "{keyword}"</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300">
              <Loader2 size={14} className="animate-spin" />
              Step {currentStep} of {LOADING_STEPS.length}
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Overall completion</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-slate-300 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {LOADING_STEPS.map((step, index) => {
              const stepNum = index + 1;
              const done = currentStep > stepNum;
              const active = currentStep === stepNum;

              return (
                <div
                  key={step.label}
                  className={`rounded-xl border p-3.5 transition-colors ${
                    done
                      ? 'border-emerald-500/30 bg-emerald-500/[0.08]'
                      : active
                        ? 'border-slate-300/30 bg-slate-300/[0.08]'
                        : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        done
                          ? 'bg-emerald-400 text-emerald-950'
                          : active
                            ? 'bg-slate-200 text-slate-900'
                            : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {done ? <Check size={14} /> : stepNum}
                    </span>

                    <p className={`text-sm font-semibold ${done || active ? 'text-white' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  <p className="mt-2 pl-8 text-xs text-slate-400">{step.helper}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {result && !isLoading && (
        <section className="rounded-3xl border border-white/10 bg-[#0f1117] p-6 sm:p-7">
          <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle size={18} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Analysis complete</h3>
                <p className="text-sm text-slate-400">Primary keyword: {result.keyword_analysis?.primary_keyword || keyword}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300">
              <Clock3 size={14} />
              Ready to review
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ResultStat
              label="ROI Score"
              value={`${result.keyword_analysis?.keyword_roi_score?.toFixed(0) ?? '-'}%`}
            />
            <ResultStat
              label="SEO Forecast"
              value={`${result.prediction?.seo_score_predicted ?? '-'}/100`}
            />
            <ResultStat
              label="Monthly Traffic"
              value={result.prediction?.estimated_monthly_traffic?.toLocaleString() ?? '-'}
            />
            <ResultStat
              label="Generated Blogs"
              value={result.blogs?.length ?? '-'}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('blogs')}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Open Blogs
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('keywords')}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Open Keyword Analysis
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('insight')}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Open Dashboard Analysis
            </button>
          </div>
        </section>
      )}

      {!isLoading && (
        <section className="rounded-3xl border border-white/10 bg-[#0f1117] p-6 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Pipeline Architecture</h2>
            <p className="mt-1 text-sm text-slate-400">
              Each run passes through seven deterministic modules so outputs remain structured and auditable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PIPELINE_NODES.map((node) => {
              const Icon = node.icon;

              return (
                <article key={node.num} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-slate-200">
                      <Icon size={16} />
                    </div>
                    <span className="rounded-md border border-white/12 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                      Step {node.num}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{node.label}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{node.desc}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function ResultStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
