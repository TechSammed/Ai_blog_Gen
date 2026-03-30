import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import { Target, ShieldAlert, BarChart2, Lightbulb, ChevronRight } from 'lucide-react';

export default function SerpSection() {
  const { result } = useApp();
  const gap = result?.gap;

  if (!gap) return <EmptyState icon={<BarChart2 size={32} className="text-zinc-600 mb-4" />} text="Generate a blog first to see SERP gap analysis" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a0a0c] border border-amber-500/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <Target size={18} />
            <span className="font-bold text-xs uppercase tracking-wider">Missing Topics</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-zinc-100 mb-1">{gap.missing_topics?.length ?? 0}</div>
          <div className="text-zinc-500 text-xs font-medium">Content gaps detected in SERP</div>
        </div>

        <div className="bg-[#0a0a0c] border border-rose-500/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-rose-400 mb-4">
            <ShieldAlert size={18} />
            <span className="font-bold text-xs uppercase tracking-wider">Competitor Weaknesses</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-zinc-100 mb-1">{gap.competitor_weakness?.length ?? 0}</div>
          <div className="text-zinc-500 text-xs font-medium">Opportunities to outrank</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─── Missing Topics ─── */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
              <Target size={16} className="text-amber-400" />
              Missing Topics
            </h3>
            <p className="text-zinc-500 text-xs mt-1">Topics competitors aren't covering — your opportunity</p>
          </div>

          <div className="space-y-2.5">
            {gap.missing_topics?.map((topic, i) => (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/20 transition-all group"
              >
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 border border-amber-500/20">
                  0{i + 1}
                </span>
                <span className="text-zinc-300 text-sm group-hover:text-zinc-100 transition-colors flex-1 font-medium">{topic}</span>
                <ChevronRight size={14} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Competitor Weaknesses ─── */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              Competitor Weaknesses
            </h3>
            <p className="text-zinc-500 text-xs mt-1">Where top-ranking pages fall short — exploit these</p>
          </div>

          <div className="space-y-2.5">
            {gap.competitor_weakness?.map((weakness, i) => (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-rose-500/20 transition-all group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40 group-hover:bg-rose-500 shrink-0 transition-colors" />
                <span className="text-zinc-300 text-sm group-hover:text-zinc-100 transition-colors flex-1 font-medium">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Opportunity Banner (SVG Icon, No Emoji) ─── */}
      <div className="bg-[#0a0a0c] border border-indigo-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40" />

        <div className="flex items-start gap-5">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
            <Lightbulb size={24} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-bold text-base mb-2">Content Strategy Insight</h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
              Your generated blogs specifically target <span className="text-amber-400 font-semibold">{gap.missing_topics?.length} content gaps</span> and
              address <span className="text-rose-400 font-semibold">{gap.competitor_weakness?.length} competitor weaknesses</span> identified
              in this SERP analysis. Publishing these blogs gives you a structural advantage over existing top-ranking pages.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}