import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import { ShieldAlert, Lightbulb, Zap, ArrowRight, Info, Users } from 'lucide-react';

export default function BlogySection() {
  const { result } = useApp();
  const analysis = result?.blogy_analysis;

  if (!analysis) return <EmptyState icon="🧩" text="Generate a blog first to see dashboard analysis" />;

  const categories = [
    { key: 'ux_issues', label: 'UX Issues', icon: <Users size={15} />, color: 'amber', emoji: '🎨' },
    { key: 'seo_issues', label: 'SEO Issues', icon: <ShieldAlert size={15} />, color: 'red', emoji: '🔍' },
    { key: 'conversion_gaps', label: 'Conversion Gaps', icon: <Zap size={15} />, color: 'orange', emoji: '💰' },
    { key: 'technical_risks', label: 'Technical Risks', icon: <Info size={15} />, color: 'rose', emoji: '⚙️' },
    { key: 'feature_suggestions', label: 'Feature Suggestions', icon: <Lightbulb size={15} />, color: 'violet', emoji: '💡' },
  ];

  const colorMap = {
    amber: { bg: 'bg-amber-500/8 border-amber-500/20', header: 'text-amber-400', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
    red: { bg: 'bg-red-500/8 border-red-500/20', header: 'text-red-400', dot: 'bg-red-400', badge: 'bg-red-500/20 text-red-300' },
    orange: { bg: 'bg-orange-500/8 border-orange-500/20', header: 'text-orange-400', dot: 'bg-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
    rose: { bg: 'bg-rose-500/8 border-rose-500/20', header: 'text-rose-400', dot: 'bg-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
    violet: { bg: 'bg-violet-500/8 border-violet-500/20', header: 'text-violet-400', dot: 'bg-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5">
          <div className="text-slate-400 text-xs mb-1 font-semibold uppercase tracking-wider">Product Differentiation</div>
          <div className="text-white font-semibold text-base leading-relaxed mt-2">{analysis.product_differentiation}</div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <div className="text-slate-400 text-xs mb-1 font-semibold uppercase tracking-wider">Scalability</div>
          <div className="text-white font-semibold text-base leading-relaxed mt-2">{analysis.scalability}</div>
        </div>
      </div>

      {/* Issue categories grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map(({ key, label, icon, color, emoji }) => {
          const items = analysis[key] ?? [];
          const c = colorMap[color];
          return (
            <div key={key} className={`glass-card rounded-2xl p-5 border ${c.bg}`}>
              <div className={`flex items-center gap-2 mb-4 ${c.header}`}>
                <span className="text-base">{emoji}</span>
                <h3 className="font-semibold text-sm">{label}</h3>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.badge}`}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 shrink-0`} />
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
                {items.length === 0 && (
                  <span className="text-slate-600 text-sm italic">None identified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvements Mapping */}
      {analysis.improvements_mapping?.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <ArrowRight size={15} className="text-emerald-400" />
            Improvements Mapping
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full ml-auto">
              {analysis.improvements_mapping.length} mapped
            </span>
          </h3>
          <div className="space-y-3">
            {analysis.improvements_mapping.map((item, i) => (
              <div key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Missing</span>
                  </div>
                  <p className="text-slate-300 text-sm">{item.missing_feature}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Your Solution</span>
                  </div>
                  <p className="text-emerald-300 text-sm font-medium">{item.your_solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score summary bar */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
        <h3 className="text-white font-semibold mb-4">Dashboard Health Score</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {categories.map(({ key, label, color, emoji }) => {
            const items = analysis[key] ?? [];
            const c = colorMap[color];
            // For issues, fewer = better; for suggestions, more = better
            const isPositive = key === 'feature_suggestions';
            const score = isPositive
              ? Math.min(100, items.length * 20)
              : Math.max(0, 100 - items.length * 18);
            return (
              <div key={key} className="text-center">
                <div className="text-lg mb-1">{emoji}</div>
                <div className={`text-lg font-black ${c.header}`}>{score}%</div>
                <div className="text-[10px] text-slate-600 leading-tight">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
