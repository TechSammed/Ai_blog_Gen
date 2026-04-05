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
} from 'lucide-react';

const CATEGORY_CONFIG = [
  { key: 'ux_issues', label: 'UX Issues', icon: Users, color: 'amber', bar: 'bg-amber-400' },
  { key: 'seo_issues', label: 'SEO Issues', icon: ShieldAlert, color: 'red', bar: 'bg-red-400' },
  { key: 'conversion_gaps', label: 'Conversion Gaps', icon: Zap, color: 'orange', bar: 'bg-orange-400' },
  { key: 'technical_risks', label: 'Technical Risks', icon: Info, color: 'rose', bar: 'bg-rose-400' },
  { key: 'feature_suggestions', label: 'Feature Suggestions', icon: Lightbulb, color: 'violet', bar: 'bg-violet-400' },
];

const COLOR_MAP = {
  amber: { bg: 'bg-amber-500/8 border-amber-500/20', header: 'text-amber-400', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  red: { bg: 'bg-red-500/8 border-red-500/20', header: 'text-red-400', dot: 'bg-red-400', badge: 'bg-red-500/20 text-red-300' },
  orange: { bg: 'bg-orange-500/8 border-orange-500/20', header: 'text-orange-400', dot: 'bg-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  rose: { bg: 'bg-rose-500/8 border-rose-500/20', header: 'text-rose-400', dot: 'bg-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
  violet: { bg: 'bg-violet-500/8 border-violet-500/20', header: 'text-violet-400', dot: 'bg-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
};

export default function BlogySection() {
  const { result } = useApp();
  const analysis = result?.blogy_analysis;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(
    () =>
      CATEGORY_CONFIG.map((cfg) => ({
        ...cfg,
        items: analysis?.[cfg.key] ?? [],
      })),
    [analysis]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => activeCategory === 'all' || activeCategory === category.key)
      .map((category) => {
        const filteredItems = category.items.filter((item) =>
          item.toLowerCase().includes(normalizedQuery)
        );
        return {
          ...category,
          filteredItems,
        };
      });
  }, [activeCategory, categories, normalizedQuery]);

  const totalIssues = categories.reduce((sum, category) => sum + category.items.length, 0);
  const criticalIssues = (analysis?.seo_issues?.length ?? 0) + (analysis?.technical_risks?.length ?? 0);
  const suggestionCount = analysis?.feature_suggestions?.length ?? 0;
  const mappedImprovements = analysis?.improvements_mapping?.length ?? 0;
  const filteredIssueCount = filteredCategories.reduce(
    (sum, category) => sum + category.filteredItems.length,
    0
  );

  const chartData = categories.map((category) => ({
    key: category.key,
    label: category.label,
    count: category.items.length,
    bar: category.bar,
  }));

  const maxChartValue = Math.max(...chartData.map((entry) => entry.count), 1);

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Issues"
          value={totalIssues}
          accent="text-slate-200"
          icon={<ListChecks size={14} className="text-slate-400" />}
        />
        <KpiCard
          label="Critical Issues"
          value={criticalIssues}
          accent="text-rose-300"
          icon={<AlertTriangle size={14} className="text-rose-400" />}
        />
        <KpiCard
          label="Feature Suggestions"
          value={suggestionCount}
          accent="text-violet-300"
          icon={<Lightbulb size={14} className="text-violet-400" />}
        />
        <KpiCard
          label="Improvements Mapped"
          value={mappedImprovements}
          accent="text-emerald-300"
          icon={<ArrowRight size={14} className="text-emerald-400" />}
        />
      </div>

      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Dashboard Filters</h3>
            <p className="text-slate-500 text-xs mt-1">
              Showing {filteredIssueCount} issue{filteredIssueCount === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <FilterX size={14} />
            Reset
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={15} className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search issue text or mapped improvements"
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-400/50"
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
      </div>

      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart2 size={15} className="text-indigo-400" />
          Issue Distribution Graph
        </h3>
        <div className="space-y-3">
          {chartData.map((entry) => (
            <div key={entry.key} className="grid grid-cols-[130px_1fr_38px] gap-3 items-center">
              <span className="text-xs text-slate-400">{entry.label}</span>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className={`h-full rounded-full ${entry.bar} transition-all duration-700`}
                  style={{ width: `${(entry.count / maxChartValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-300 text-right font-mono">{entry.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-violet-500/20 bg-linear-to-br from-violet-500/10 to-purple-500/5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={14} className="text-violet-400" />
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Product Differentiation
            </div>
          </div>
          <div className="text-white font-semibold text-base leading-relaxed mt-2">
            {analysis.product_differentiation}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-blue-500/20 bg-linear-to-br from-blue-500/10 to-cyan-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} className="text-blue-400" />
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Scalability</div>
          </div>
          <div className="text-white font-semibold text-base leading-relaxed mt-2">{analysis.scalability}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const c = COLOR_MAP[category.color];
          return (
            <div key={category.key} className={`glass-card rounded-2xl p-5 border ${c.bg}`}>
              <div className={`flex items-center gap-2 mb-4 ${c.header}`}>
                <Icon size={16} />
                <h3 className="font-semibold text-sm">{category.label}</h3>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.badge}`}>
                  {normalizedQuery
                    ? `${category.filteredItems.length}/${category.items.length}`
                    : category.items.length}
                </span>
              </div>

              <div className="space-y-2">
                {category.filteredItems.map((item, index) => (
                  <div key={`${category.key}-${index}`} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 shrink-0`} />
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
                {category.filteredItems.length === 0 && (
                  <span className="text-slate-600 text-sm italic">No matching items</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredImprovements.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <ArrowRight size={15} className="text-emerald-400" />
            Improvements Mapping
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full ml-auto font-medium">
              {filteredImprovements.length} Mapped
            </span>
          </h3>
          <div className="space-y-3">
            {filteredImprovements.map((item, index) => (
              <div
                key={`${item.missing_feature}-${index}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/[0.07] hover:border-white/12 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Missing</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.missing_feature}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <ArrowRight
                    size={16}
                    className="text-emerald-400 group-hover:translate-x-1 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                      Your Solution
                    </span>
                  </div>
                  <p className="text-emerald-300 text-sm font-medium leading-relaxed">{item.your_solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon, accent }) {
  return (
    <div className="glass-card rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-2 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
        active
          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  );
}
