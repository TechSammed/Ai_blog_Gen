import React from 'react';
import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import {
  BarChart2, Users, Gauge, AlertTriangle,
  Target, Rocket, Swords, Clock
} from 'lucide-react';

export default function PredictionSection() {
  const { result } = useApp();
  const p = result?.prediction;

  if (!p) return <EmptyState icon="📈" text="Generate a blog first to see performance predictions" />;

  const difficultyColor = { Low: 'emerald', Medium: 'yellow', High: 'red' }[p.ranking_difficulty] || 'yellow';
  const trafficColor = { Low: 'red', Medium: 'yellow', High: 'emerald', 'Very High': 'violet' }[p.traffic_potential] || 'blue';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ─── Main Metrics ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Custom, Flat SEO Score Ring */}
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-sm group hover:border-white/10 transition-colors sm:col-span-2 lg:col-span-1">
          <CleanScoreRing value={p.seo_score_predicted} max={100} label="Predicted SEO" />
        </div>

        <StatCard
          icon={<BarChart2 size={18} className="text-blue-400" />}
          label="Traffic Potential"
          value={p.traffic_potential}
          color={trafficColor}
          sub="Based on keyword volume"
        />
        <StatCard
          icon={<Gauge size={18} className="text-amber-400" />}
          label="Ranking Difficulty"
          value={p.ranking_difficulty}
          color={difficultyColor}
          sub="Competition level"
          invert
        />
        <StatCard
          icon={<Users size={18} className="text-emerald-400" />}
          label="Est. Monthly Traffic"
          value={p.estimated_monthly_traffic?.toLocaleString()}
          color="emerald"
          sub="Visitors / month"
        />
      </div>

      {/* ─── Traffic Projection Bar Chart ─── */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-zinc-100 font-semibold mb-6 flex items-center gap-2">
          <BarChart2 size={16} className="text-blue-400" />
          Traffic Growth Projection (Monthly)
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Month 1–2', pct: 10, note: 'Indexing phase' },
            { label: 'Month 3', pct: 30, note: 'Ranking climb' },
            { label: 'Month 4', pct: 55, note: 'Authority build' },
            { label: 'Month 5', pct: 80, note: 'Peak growth' },
            { label: 'Month 6+', pct: 100, note: 'Full potential' },
          ].map(({ label, pct, note }) => {
            const est = Math.round((p.estimated_monthly_traffic * pct) / 100);
            return (
              <div key={label} className="flex items-center gap-4 group">
                <span className="text-zinc-400 text-xs font-medium w-20 shrink-0">{label}</span>

                {/* Flat, solid color bar */}
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="text-zinc-200 text-xs font-mono font-medium w-16 text-right">
                  {est.toLocaleString()}
                </span>
                <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider w-24 hidden sm:block">
                  {note}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Insights ─── */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-zinc-100 font-semibold mb-5 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InsightCard
            icon={<Target size={16} className="text-violet-400" />}
            title="SEO Score Target"
            body={`Predicted score of ${p.seo_score_predicted}/100. Scores above 70 typically rank on page 1 within 90 days.`}
          />
          <InsightCard
            icon={<Rocket size={16} className="text-blue-400" />}
            title="Traffic Potential"
            body={`${p.traffic_potential} potential with up to ${p.estimated_monthly_traffic?.toLocaleString()} monthly visitors at full ranking.`}
          />
          <InsightCard
            icon={<Swords size={16} className="text-amber-400" />}
            title="Competition Level"
            body={`Ranking difficulty is ${p.ranking_difficulty}. ${p.ranking_difficulty === 'Low' ? 'Expect rankings within 30–60 days.' : p.ranking_difficulty === 'Medium' ? 'Expect rankings within 60–120 days with consistent publishing.' : 'Build topical authority with 5+ supporting posts.'}`}
          />
          <InsightCard
            icon={<Clock size={16} className="text-emerald-400" />}
            title="Time to Results"
            body={`Based on these metrics, expect measurable organic traffic growth within ${p.ranking_difficulty === 'Low' ? '30–60' : p.ranking_difficulty === 'Medium' ? '60–90' : '90–120'} days.`}
          />
        </div>
      </div>
    </div>
  );
}

// Inline Clean Score Ring (Replaces the glowing external component)
function CleanScoreRing({ value, max = 100, label }) {
  const radius = 46;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / max) * circumference;

  // Solid, flat colors based on score
  const ringColor = value >= 80 ? 'text-emerald-500' : value >= 60 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-zinc-500" />
        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background track */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-zinc-800"
          />
          {/* Foreground progress indicator */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`${ringColor} transition-all duration-1000 ease-out`}
          />
        </svg>
        {/* Inner text score */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-zinc-100">{value}</span>
        </div>
      </div>
    </div>
  );
}

// Clean, Flat Stat Card
function StatCard({ icon, label, value, color, sub }) {
  const colorMap = {
    emerald: 'text-emerald-400',
    yellow: 'text-amber-400',
    red: 'text-rose-400',
    blue: 'text-blue-400',
    violet: 'text-violet-400',
  };

  const textColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-sm group hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div>
        <div className={`text-3xl font-bold tracking-tight mb-1 ${textColor}`}>
          {value}
        </div>
        <div className="text-zinc-500 text-xs font-medium">{sub}</div>
      </div>
    </div>
  );
}

// Premium Insight Card with SVG Icons
function InsightCard({ icon, title, body }) {
  return (
    <div className="rounded-xl p-5 bg-zinc-900/50 border border-white/5 hover:bg-zinc-900/80 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[#0a0a0c] border border-white/5 shadow-sm">
          {icon}
        </div>
        <span className="text-zinc-100 font-semibold text-sm">{title}</span>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed">{body}</p>
    </div>
  );
}