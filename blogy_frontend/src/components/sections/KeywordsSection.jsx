import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import { Tag, Star, Link2, TrendingUp } from 'lucide-react';

export default function KeywordsSection() {
  const { result } = useApp();
  const kw = result?.keyword_analysis;

  if (!kw) return <EmptyState icon="🔍" text="Generate a blog first to see keyword analysis" />;

  const roiColor = kw.keyword_roi_score >= 80 ? 'emerald' : kw.keyword_roi_score >= 60 ? 'yellow' : 'red';

  // Dynamic solid background color for the progress bar
  const roiBarBg = kw.keyword_roi_score >= 80 ? 'bg-emerald-500' : kw.keyword_roi_score >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ─── Header Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Primary Keyword"
          value={kw.primary_keyword}
          icon={<Tag size={18} />}
          small
          color="violet"
        />
        <MetricCard
          label="ROI Score"
          value={`${kw.keyword_roi_score?.toFixed(1)}%`}
          icon={<TrendingUp size={18} />}
          color={roiColor}
          badge={kw.keyword_roi_score >= 70 ? 'High Value' : 'Medium'}
        />
        <MetricCard
          label="Secondary Keywords"
          value={kw.secondary_keywords?.length ?? 0}
          icon={<Star size={18} />}
          color="blue"
        />
        <MetricCard
          label="Long-tail Keywords"
          value={kw.long_tail_keywords?.length ?? 0}
          icon={<Tag size={18} />}
          color="teal"
        />
      </div>

      {/* ─── ROI Score Bar (Clean, Solid Color) ─── */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-zinc-100 font-semibold">Keyword ROI Score</h3>
          <span className="text-2xl font-bold text-zinc-100">{kw.keyword_roi_score?.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${roiBarBg}`}
            style={{ width: `${Math.min(100, kw.keyword_roi_score)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500 mt-2 font-medium">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ─── Secondary Keywords ─── */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
              <Star size={16} className="text-blue-400" />
              Secondary Keywords
            </h3>
            <span className="text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">
              {kw.secondary_keywords?.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {kw.secondary_keywords?.map((kword, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-300 text-sm font-medium hover:bg-blue-500/10 transition-colors cursor-default"
              >
                {kword}
              </span>
            ))}
          </div>
        </div>

        {/* ─── Long-tail Keywords ─── */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-400" />
              Long-tail Keywords
            </h3>
            <span className="text-xs font-bold bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full">
              {kw.long_tail_keywords?.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {kw.long_tail_keywords?.map((kword, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-zinc-600 text-xs font-mono font-bold w-5">0{i + 1}</span>
                <span className="text-zinc-200 text-sm font-medium flex-1 truncate">{kword}</span>
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${100 - i * 12}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Internal Linking ─── */}
      {kw.internal_linking_suggestions?.length > 0 && (
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-zinc-100 font-semibold mb-5 flex items-center gap-2">
            <Link2 size={16} className="text-orange-400" />
            Internal Linking Suggestions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kw.internal_linking_suggestions.map((link, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/20 transition-colors">
                <div className="p-1.5 rounded-md bg-orange-500/10">
                  <Link2 size={14} className="text-orange-400 shrink-0" />
                </div>
                <span className="text-orange-200/90 text-sm font-medium truncate">{link}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Clean, Colorful, Flat Metric Card
function MetricCard({ label, value, icon, color, badge, small }) {
  const colorMap = {
    violet: { icon: 'text-violet-400', value: 'text-zinc-100', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    blue: { icon: 'text-blue-400', value: 'text-zinc-100', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    emerald: { icon: 'text-emerald-400', value: 'text-zinc-100', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    teal: { icon: 'text-teal-400', value: 'text-zinc-100', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    yellow: { icon: 'text-amber-400', value: 'text-zinc-100', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    red: { icon: 'text-rose-400', value: 'text-zinc-100', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };

  const c = colorMap[color] || colorMap.violet;

  return (
    <div className="rounded-2xl p-5 bg-[#0a0a0c] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`flex items-center gap-2 ${c.icon} mb-3`}>
        {icon}
        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex items-end justify-between">
        <div className={`font-bold tracking-tight ${small ? 'text-lg truncate' : 'text-3xl'} ${c.value}`}>
          {value}
        </div>
        {badge && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${c.badge}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}