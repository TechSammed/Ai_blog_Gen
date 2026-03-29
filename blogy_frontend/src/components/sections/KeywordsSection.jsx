import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import { Tag, Star, Link2, TrendingUp } from 'lucide-react';

export default function KeywordsSection() {
  const { result } = useApp();
  const kw = result?.keyword_analysis;

  if (!kw) return <EmptyState icon="🔍" text="Generate a blog first to see keyword analysis" />;

  const roiColor = kw.keyword_roi_score >= 80 ? 'emerald' : kw.keyword_roi_score >= 60 ? 'yellow' : 'red';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Primary Keyword"
          value={kw.primary_keyword}
          icon={<Tag size={16} />}
          small
          color="violet"
        />
        <MetricCard
          label="ROI Score"
          value={`${kw.keyword_roi_score?.toFixed(1)}%`}
          icon={<TrendingUp size={16} />}
          color={roiColor}
          badge={kw.keyword_roi_score >= 70 ? 'High Value' : 'Medium'}
        />
        <MetricCard
          label="Secondary Keywords"
          value={kw.secondary_keywords?.length ?? 0}
          icon={<Star size={16} />}
          color="blue"
        />
        <MetricCard
          label="Long-tail Keywords"
          value={kw.long_tail_keywords?.length ?? 0}
          icon={<Tag size={16} />}
          color="teal"
        />
      </div>

      {/* ROI Score bar */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Keyword ROI Score</h3>
          <span className={`text-2xl font-black gradient-text`}>{kw.keyword_roi_score?.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-1000 shadow-lg shadow-violet-500/30"
            style={{ width: `${Math.min(100, kw.keyword_roi_score)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1.5">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Secondary Keywords */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star size={15} className="text-blue-400" />
            Secondary Keywords
            <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{kw.secondary_keywords?.length}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {kw.secondary_keywords?.map((kword, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm hover:bg-blue-500/20 transition-colors cursor-default">
                {kword}
              </span>
            ))}
          </div>
        </div>

        {/* Long-tail Keywords */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-teal-400" />
            Long-tail Keywords
            <span className="ml-auto text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">{kw.long_tail_keywords?.length}</span>
          </h3>
          <div className="space-y-2">
            {kw.long_tail_keywords?.map((kword, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                <span className="text-slate-600 text-xs font-mono w-5">#{i + 1}</span>
                <span className="text-slate-300 text-sm flex-1">{kword}</span>
                <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${100 - i * 12}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Internal Linking */}
      {kw.internal_linking_suggestions?.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Link2 size={15} className="text-orange-400" />
            Internal Linking Suggestions
          </h3>
          <div className="space-y-2">
            {kw.internal_linking_suggestions.map((link, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15 hover:border-orange-500/30 transition-colors">
                <Link2 size={12} className="text-orange-400 shrink-0" />
                <span className="text-orange-300/80 text-sm font-mono">{link}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color, badge, small }) {
  const colorMap = {
    violet: { bg: 'bg-violet-500/10 border-violet-500/20', icon: 'text-violet-400', text: 'text-violet-300', badge: 'bg-violet-500/20 text-violet-300' },
    blue: { bg: 'bg-blue-500/10 border-blue-500/20', icon: 'text-blue-400', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300' },
    emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300' },
    teal: { bg: 'bg-teal-500/10 border-teal-500/20', icon: 'text-teal-400', text: 'text-teal-300', badge: 'bg-teal-500/20 text-teal-300' },
    yellow: { bg: 'bg-yellow-500/10 border-yellow-500/20', icon: 'text-yellow-400', text: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-300' },
    red: { bg: 'bg-red-500/10 border-red-500/20', icon: 'text-red-400', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' },
  };
  const c = colorMap[color] || colorMap.violet;
  return (
    <div className={`rounded-2xl p-5 border ${c.bg}`}>
      <div className={`flex items-center gap-2 ${c.icon} mb-2`}>
        {icon}
        <span className="text-slate-400 text-xs">{label}</span>
      </div>
      <div className={`font-bold ${small ? 'text-base truncate' : 'text-2xl'} ${c.text}`}>{value}</div>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${c.badge}`}>{badge}</span>
      )}
    </div>
  );
}
