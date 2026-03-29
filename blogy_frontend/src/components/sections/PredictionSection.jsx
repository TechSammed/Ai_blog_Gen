import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import ScoreRing from '../ui/ScoreRing';
import { BarChart2, Users, Gauge, AlertTriangle } from 'lucide-react';

export default function PredictionSection() {
  const { result } = useApp();
  const p = result?.prediction;

  if (!p) return <EmptyState icon="📈" text="Generate a blog first to see performance predictions" />;

  const difficultyColor = { Low: 'emerald', Medium: 'yellow', High: 'red' }[p.ranking_difficulty] || 'yellow';
  const trafficColor = { Low: 'red', Medium: 'yellow', High: 'emerald', 'Very High': 'violet' }[p.traffic_potential] || 'blue';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SEO Score Ring */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 sm:col-span-2 lg:col-span-1">
          <ScoreRing value={p.seo_score_predicted} max={100} label="Predicted SEO Score" size={120} />
        </div>

        <StatCard
          icon={<BarChart2 size={20} className="text-blue-400" />}
          label="Traffic Potential"
          value={p.traffic_potential}
          color={trafficColor}
          sub="Based on keyword volume"
        />
        <StatCard
          icon={<Gauge size={20} className="text-amber-400" />}
          label="Ranking Difficulty"
          value={p.ranking_difficulty}
          color={difficultyColor}
          sub="Competition level"
          invert
        />
        <StatCard
          icon={<Users size={20} className="text-emerald-400" />}
          label="Est. Monthly Traffic"
          value={p.estimated_monthly_traffic?.toLocaleString()}
          color="emerald"
          sub="Visitors / month"
        />
      </div>

      {/* Traffic projection bar chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
          <BarChart2 size={15} className="text-blue-400" />
          Traffic Growth Projection (Monthly)
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Month 1–2', pct: 10, note: 'Indexing phase' },
            { label: 'Month 3', pct: 30, note: 'Ranking climb' },
            { label: 'Month 4', pct: 55, note: 'Authority build' },
            { label: 'Month 5', pct: 80, note: 'Peak growth' },
            { label: 'Month 6+', pct: 100, note: 'Full potential' },
          ].map(({ label, pct, note }) => {
            const est = Math.round((p.estimated_monthly_traffic * pct) / 100);
            return (
              <div key={label} className="flex items-center gap-4">
                <span className="text-slate-400 text-xs w-20 shrink-0">{label}</span>
                <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-violet-300 text-xs font-mono w-16 text-right">{est.toLocaleString()}</span>
                <span className="text-slate-600 text-[10px] w-24 hidden sm:block">{note}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-400" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InsightCard
            color="violet"
            icon="🎯"
            title="SEO Score Target"
            body={`Predicted score of ${p.seo_score_predicted}/100. Scores above 70 typically rank on page 1 within 90 days.`}
          />
          <InsightCard
            color="blue"
            icon="🚀"
            title="Traffic Potential"
            body={`${p.traffic_potential} potential with up to ${p.estimated_monthly_traffic?.toLocaleString()} monthly visitors at full ranking.`}
          />
          <InsightCard
            color="amber"
            icon="⚔️"
            title="Competition Level"
            body={`Ranking difficulty is ${p.ranking_difficulty}. ${p.ranking_difficulty === 'Low' ? 'Expect rankings within 30–60 days.' : p.ranking_difficulty === 'Medium' ? 'Expect rankings within 60–120 days with consistent publishing.' : 'Build topical authority with 5+ supporting posts.'}`}
          />
          <InsightCard
            color="emerald"
            icon="📅"
            title="Time to Results"
            body={`Based on these metrics, expect measurable organic traffic growth within ${p.ranking_difficulty === 'Low' ? '30–60' : p.ranking_difficulty === 'Medium' ? '60–90' : '90–120'} days.`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, invert }) {
  const colorMap = {
    emerald: { bg: 'from-emerald-500/10 to-green-500/5 border-emerald-500/20', text: 'text-emerald-300' },
    yellow: { bg: 'from-yellow-500/10 to-amber-500/5 border-yellow-500/20', text: 'text-yellow-300' },
    red: { bg: 'from-red-500/10 to-rose-500/5 border-red-500/20', text: 'text-red-300' },
    blue: { bg: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20', text: 'text-blue-300' },
    violet: { bg: 'from-violet-500/10 to-purple-500/5 border-violet-500/20', text: 'text-violet-300' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${c.bg} border`}>
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-slate-400 text-xs">{label}</span></div>
      <div className={`text-2xl font-black mb-1 ${c.text}`}>{value}</div>
      <div className="text-slate-600 text-xs">{sub}</div>
    </div>
  );
}

function InsightCard({ color, icon, title, body }) {
  const colors = {
    violet: 'from-violet-500/8 to-purple-500/5 border-violet-500/20',
    blue: 'from-blue-500/8 to-indigo-500/5 border-blue-500/20',
    amber: 'from-amber-500/8 to-orange-500/5 border-amber-500/20',
    emerald: 'from-emerald-500/8 to-green-500/5 border-emerald-500/20',
  };
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-white font-semibold text-sm">{title}</span>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">{body}</p>
    </div>
  );
}
