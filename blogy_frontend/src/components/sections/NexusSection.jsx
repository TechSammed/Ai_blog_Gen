import React, { useMemo, useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import {
  ShieldAlert,
  Lightbulb,
  Zap,
  ArrowRight,
  Info,
  Users,
  BarChart2,
  Layers,
  Search,
  FilterX,
  AlertTriangle,
  ListChecks,
  PieChart,
  Gauge,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_CONFIG = [
  { key: 'ux_issues', label: 'UX Issues', icon: Users, tone: 'amber', severity: 'Medium' },
  { key: 'seo_issues', label: 'SEO Issues', icon: ShieldAlert, tone: 'red', severity: 'High' },
  { key: 'conversion_gaps', label: 'Conversion Gaps', icon: Zap, tone: 'orange', severity: 'Medium' },
  { key: 'technical_risks', label: 'Technical Risks', icon: Info, tone: 'rose', severity: 'High' },
  { key: 'feature_suggestions', label: 'Feature Suggestions', icon: Lightbulb, tone: 'violet', severity: 'Low' },
];

const TONE_MAP = {
  amber: {
    card: 'border-amber-500/25 bg-amber-500/[0.08]',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    soft: 'text-amber-200',
    stroke: '#f59e0b',
  },
  red: {
    card: 'border-red-500/25 bg-red-500/[0.08]',
    text: 'text-red-300',
    dot: 'bg-red-400',
    soft: 'text-red-200',
    stroke: '#f43f5e',
  },
  orange: {
    card: 'border-orange-500/25 bg-orange-500/[0.08]',
    text: 'text-orange-300',
    dot: 'bg-orange-400',
    soft: 'text-orange-200',
    stroke: '#fb923c',
  },
  rose: {
    card: 'border-rose-500/25 bg-rose-500/[0.08]',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    soft: 'text-rose-200',
    stroke: '#fb7185',
  },
  violet: {
    card: 'border-violet-500/25 bg-violet-500/[0.08]',
    text: 'text-violet-300',
    dot: 'bg-violet-400',
    soft: 'text-violet-200',
    stroke: '#a78bfa',
  },
};

const PRIORITY_BUCKETS = [
  { id: 'high', label: 'High Priority', description: 'Resolve immediately', tone: 'red', keys: ['seo_issues', 'technical_risks'] },
  { id: 'medium', label: 'Medium Priority', description: 'Schedule next sprint', tone: 'amber', keys: ['ux_issues', 'conversion_gaps'] },
  { id: 'low', label: 'Low Priority', description: 'Iterative improvements', tone: 'violet', keys: ['feature_suggestions'] },
];

export default function NexusSection() {
  const { result } = useApp();
  const analysis = result?.blogy_analysis;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categories = useMemo(
    () =>
      CATEGORY_CONFIG.map((config) => {
        const items = analysis?.[config.key] ?? [];
        const filteredItems = items.filter((item) => item.toLowerCase().includes(normalizedQuery));

        return {
          ...config,
          items,
          filteredItems,
          count: items.length,
        };
      }),
    [analysis, normalizedQuery]
  );

  const totalIssues = categories.reduce((sum, category) => sum + category.count, 0);
  const criticalIssues = (analysis?.seo_issues?.length ?? 0) + (analysis?.technical_risks?.length ?? 0);
  const suggestionCount = analysis?.feature_suggestions?.length ?? 0;
  const mappedImprovements = analysis?.improvements_mapping?.length ?? 0;

  const healthScore = useMemo(() => {
    if (!totalIssues) return 100;
    const criticalRatio = criticalIssues / totalIssues;
    const penalty = Math.round(criticalRatio * 55 + Math.min(totalIssues, 14));
    return Math.max(24, 100 - penalty);
  }, [criticalIssues, totalIssues]);

  const shareData = useMemo(() => {
    if (!totalIssues) return [];
    return categories
      .filter((category) => category.count > 0)
      .map((category) => ({
        ...category,
        percentage: Math.round((category.count / totalIssues) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [categories, totalIssues]);

  const topCategory = shareData[0];

  const priorityData = useMemo(() => {
    return PRIORITY_BUCKETS.map((bucket) => {
      const items = bucket.keys.flatMap((key) => analysis?.[key] ?? []);
      const filteredItems = normalizedQuery
        ? items.filter((item) => item.toLowerCase().includes(normalizedQuery))
        : items;

      return {
        ...bucket,
        items,
        filteredItems,
        count: items.length,
      };
    });
  }, [analysis, normalizedQuery]);

  const maxPriorityCount = Math.max(...priorityData.map((item) => item.count), 1);

  const visibleCategories = categories.filter(
    (category) => activeCategory === 'all' || activeCategory === category.key
  );

  const filteredIssueCount = visibleCategories.reduce(
    (sum, category) => sum + category.filteredItems.length,
    0
  );

  const filteredImprovements = (analysis?.improvements_mapping ?? []).filter((item) => {
    if (!normalizedQuery) return true;
    return `${item.missing_feature} ${item.your_solution}`
      .toLowerCase()
      .includes(normalizedQuery);
  });

  if (!analysis) {
    return (
      <EmptyState
        icon={<Layers size={32} className="text-zinc-600 mb-4" />}
        text="Generate a blog first to see dashboard analysis"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Dashboard Analysis</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Content Quality and Growth Opportunities</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Review issue distribution, priority buckets, and mapped fixes from the latest generated strategy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
            <SummaryStat
              icon={<ListChecks size={15} className="text-slate-300" />}
              label="Total Issues"
              value={totalIssues}
              tone="neutral"
            />
            <SummaryStat
              icon={<AlertTriangle size={15} className="text-rose-300" />}
              label="Critical"
              value={criticalIssues}
              tone="danger"
            />
            <SummaryStat
              icon={<Lightbulb size={15} className="text-violet-300" />}
              label="Suggestions"
              value={suggestionCount}
              tone="accent"
            />
            <SummaryStat
              icon={<ArrowRight size={15} className="text-emerald-300" />}
              label="Mapped"
              value={mappedImprovements}
              tone="success"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-[#0f1117] p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-slate-300" />
            <h3 className="text-sm font-semibold text-white">Issue Category Share</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
            <DonutChart data={shareData} total={totalIssues} />
            <div className="space-y-2.5">
              {shareData.length > 0 ? (
                shareData.map((item) => {
                  const tone = TONE_MAP[item.tone];
                  return (
                    <div key={item.key} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/2 px-3 py-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                      <span className="flex-1 text-sm text-slate-300">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.count}</span>
                      <span className="text-xs text-slate-500">{item.percentage}%</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No issues to chart yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f1117] p-5 xl:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Gauge size={16} className="text-slate-300" />
            <h3 className="text-sm font-semibold text-white">Health and Priority Overview</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-white/2 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Health Score</p>
              <p className="mt-2 text-3xl font-semibold text-white">{healthScore}<span className="text-lg text-slate-500">/100</span></p>
              <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-slate-300 transition-all duration-700"
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {healthScore >= 75
                  ? 'Strong quality baseline with manageable risk.'
                  : healthScore >= 50
                    ? 'Solid base, but key issues need prioritization.'
                    : 'Quality risk is elevated. Prioritize high severity fixes first.'}
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/2 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Top Concern</p>
              <p className="mt-2 text-lg font-semibold text-white">{topCategory?.label ?? 'No issue data'}</p>
              <p className="mt-1 text-sm text-slate-400">
                {topCategory ? `${topCategory.count} items (${topCategory.percentage}%)` : 'Run analysis to populate this summary.'}
              </p>
              <div className="mt-4 space-y-2">
                {priorityData.map((bucket) => {
                  const tone = TONE_MAP[bucket.tone];
                  return (
                    <div key={bucket.id} className="flex items-center gap-2 text-xs">
                      <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                      <span className="text-slate-400">{bucket.label}</span>
                      <span className="ml-auto font-semibold text-white">{bucket.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/2 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Execution Signal</p>
              <p className="mt-2 text-lg font-semibold text-white">{mappedImprovements} fixes mapped</p>
              <p className="mt-1 text-sm text-slate-400">Clear path from missing feature to recommended solution.</p>
              <div className="mt-4 space-y-2">
                {filteredImprovements.slice(0, 3).map((item, index) => (
                  <div key={`${item.missing_feature}-${index}`} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-xs text-slate-300">
                    {item.missing_feature}
                  </div>
                ))}
                {filteredImprovements.length === 0 && (
                  <p className="text-xs text-slate-500">No mapped items match the current filter.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Priority Matrix</h3>
          <p className="text-xs text-slate-500">Grouped by expected delivery urgency</p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {priorityData.map((bucket) => {
            const tone = TONE_MAP[bucket.tone];
            const width = Math.max(8, Math.round((bucket.count / maxPriorityCount) * 100));

            return (
              <div key={bucket.id} className={`rounded-xl border p-4 ${tone.card}`}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${tone.text}`}>{bucket.label}</p>
                    <p className="text-xs text-slate-400">{bucket.description}</p>
                  </div>
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs font-semibold text-white">
                    {bucket.count}
                  </span>
                </div>

                <div className="mb-3 h-1.5 w-full rounded-full bg-black/25">
                  <div className={`h-1.5 rounded-full ${tone.dot}`} style={{ width: `${width}%` }} />
                </div>

                <div className="space-y-2">
                  {bucket.filteredItems.slice(0, 2).map((item, index) => (
                    <p key={`${bucket.id}-${index}`} className="text-xs leading-relaxed text-slate-300">
                      {item}
                    </p>
                  ))}
                  {bucket.filteredItems.length === 0 && (
                    <p className="text-xs text-slate-500">No matching items in this bucket.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Explore and Filter Issues</h3>
            <p className="mt-1 text-xs text-slate-500">Showing {filteredIssueCount} matching issue{filteredIssueCount === 1 ? '' : 's'}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/2 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <FilterX size={14} />
            Reset Filters
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search issue text or mapped improvements"
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-slate-400/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={activeCategory === 'all'}
            label="All Categories"
            onClick={() => setActiveCategory('all')}
          />
          {CATEGORY_CONFIG.map((category) => (
            <FilterChip
              key={category.key}
              active={activeCategory === category.key}
              label={category.label}
              onClick={() => setActiveCategory(category.key)}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visibleCategories.map((category) => {
          const Icon = category.icon;
          const tone = TONE_MAP[category.tone];

          return (
            <article key={category.key} className={`rounded-2xl border p-5 ${tone.card}`}>
              <div className="mb-4 flex items-center gap-2">
                <Icon size={16} className={tone.text} />
                <h4 className={`text-sm font-semibold ${tone.text}`}>{category.label}</h4>
                <span className="ml-auto rounded-full border border-white/15 px-2 py-0.5 text-xs font-semibold text-white">
                  {normalizedQuery ? `${category.filteredItems.length}/${category.count}` : category.count}
                </span>
              </div>

              <div className="space-y-2">
                {category.filteredItems.length > 0 ? (
                  category.filteredItems.map((item, index) => (
                    <div key={`${category.key}-${index}`} className="flex items-start gap-2.5">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                      <p className="text-sm leading-relaxed text-slate-300">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm italic text-slate-500">No matching items in this category.</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
                Severity: <span className={tone.soft}>{category.severity}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0f1117] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-300" />
          <h3 className="text-sm font-semibold text-white">Improvements Roadmap</h3>
          <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
            {filteredImprovements.length} mapped
          </span>
        </div>

        {filteredImprovements.length > 0 ? (
          <div className="space-y-3">
            {filteredImprovements.map((item, index) => (
              <div key={`${item.missing_feature}-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-300">Missing Feature</p>
                    <p className="mt-1 text-sm text-slate-300">{item.missing_feature}</p>
                  </div>

                  <div className="flex justify-center text-slate-500">
                    <ArrowRight size={16} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">Recommended Solution</p>
                    <p className="mt-1 text-sm font-medium text-emerald-200">{item.your_solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No mapped improvements match the current filter.</p>
        )}
      </section>
    </div>
  );
}

function SummaryStat({ icon, label, value, tone }) {
  const toneClass = {
    neutral: 'border-white/10 bg-white/2 text-white',
    danger: 'border-rose-500/30 bg-rose-500/[0.08] text-rose-200',
    accent: 'border-violet-500/30 bg-violet-500/[0.08] text-violet-200',
    success: 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200',
  }[tone] || 'border-white/10 bg-white/2 text-white';

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-semibold">{value}</p>
    </div>
  );
}

function DonutChart({ data, total }) {
  const radius = 44;
  const size = 120;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;

  const { segments } = data.reduce(
    (acc, item) => {
      const value = total > 0 ? (item.count / total) * circumference : 0;
      const segment = {
        key: item.key,
        value,
        offset: acc.offset,
        stroke: TONE_MAP[item.tone].stroke,
      };

      return {
        offset: acc.offset + value,
        segments: [...acc.segments, segment],
      };
    },
    { offset: 0, segments: [] }
  );

  return (
    <div className="mx-auto flex h-42.5 w-42.5 items-center justify-center rounded-full border border-white/8 bg-black/20">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
          />

          {segments.map((segment) => (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.stroke}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${segment.value} ${circumference}`}
              strokeDashoffset={-segment.offset}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-semibold text-white">{total}</span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Issues</span>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
        active
          ? 'border-slate-300/40 bg-slate-300/10 text-white'
          : 'border-white/10 bg-white/2 text-slate-400 hover:border-white/20 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
