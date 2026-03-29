import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import { Target, ShieldAlert } from 'lucide-react';

export default function SerpSection() {
  const { result } = useApp();
  const gap = result?.gap;

  if (!gap) return <EmptyState icon="📊" text="Generate a blog first to see SERP gap analysis" />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Target size={18} />
            <span className="font-semibold text-sm">Missing Topics</span>
          </div>
          <div className="text-4xl font-black text-amber-300 mb-1">{gap.missing_topics?.length ?? 0}</div>
          <div className="text-slate-500 text-xs">Content gaps detected in SERP</div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-400 mb-3">
            <ShieldAlert size={18} />
            <span className="font-semibold text-sm">Competitor Weaknesses</span>
          </div>
          <div className="text-4xl font-black text-red-300 mb-1">{gap.competitor_weakness?.length ?? 0}</div>
          <div className="text-slate-500 text-xs">Opportunities to outrank</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Topics */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Target size={15} className="text-amber-400" />
            Missing Topics
          </h3>
          <p className="text-slate-500 text-xs mb-4">Topics competitors aren't covering — your opportunity</p>
          <div className="space-y-2">
            {gap.missing_topics?.map((topic, i) => (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 hover:border-amber-500/35 transition-all group"
              >
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-300 text-sm group-hover:text-white transition-colors flex-1">{topic}</span>
                <span className="text-amber-500/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Gap &rarr;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Weaknesses */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <ShieldAlert size={15} className="text-red-400" />
            Competitor Weaknesses
          </h3>
          <p className="text-slate-500 text-xs mb-4">Where top-ranking pages fall short — exploit these</p>
          <div className="space-y-2">
            {gap.competitor_weakness?.map((weakness, i) => (
              <div key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 hover:border-red-500/35 transition-all group"
              >
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="text-slate-300 text-sm group-hover:text-white transition-colors flex-1">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunity banner */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-white font-semibold mb-2">Content Strategy Insight</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your generated blogs specifically target <strong className="text-violet-300">{gap.missing_topics?.length} content gaps</strong> and 
              address <strong className="text-red-300">{gap.competitor_weakness?.length} competitor weaknesses</strong> identified 
              in this SERP analysis. Publishing these blogs gives you a structural advantage over existing top-ranking pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
