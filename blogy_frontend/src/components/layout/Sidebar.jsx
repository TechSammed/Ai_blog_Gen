import { useApp, SECTIONS } from '../../hooks/useAppContext';
import {
  Zap, Search, Activity, TrendingUp, FileText, LayoutGrid,
  ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  zap: Zap,
  search: Search,
  activity: Activity,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'layout-grid': LayoutGrid,
};

const SECTION_COLORS = {
  generate: 'from-violet-500 to-purple-600',
  keywords: 'from-blue-500 to-indigo-600',
  serp: 'from-cyan-500 to-blue-600',
  prediction: 'from-emerald-500 to-green-600',
  blogs: 'from-orange-500 to-amber-600',
  blogy: 'from-pink-500 to-rose-600',
};

export default function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, result } = useApp();

  const hasData = (section) => {
    if (!result) return false;
    const map = {
      keywords: !!result.keyword_analysis,
      serp: !!result.gap,
      prediction: !!result.prediction,
      blogs: result.blogs?.length > 0,
      blogy: !!result.blogy_analysis,
    };
    return map[section] ?? false;
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-16'}
        bg-[#0d0d16] border-r border-white/[0.06]`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] shrink-0`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path d="M4 6h6a2 2 0 010 4H4V6z" fill="white" opacity="0.9"/>
            <path d="M4 10h7a2 2 0 010 4H4V10z" fill="white" opacity="0.65"/>
            <circle cx="14" cy="5" r="2" fill="#C4B5FD"/>
          </svg>
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <span className="text-white font-bold text-lg tracking-tight leading-none">
              Blogy
              <span className="text-violet-400 text-xs font-semibold ml-1 bg-violet-500/20 px-1.5 py-0.5 rounded-full">AI</span>
            </span>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-none">Blog Intelligence Engine</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {sidebarOpen && (
          <p className="text-slate-600 text-[10px] font-semibold tracking-widest uppercase px-4 mb-2">
            Navigation
          </p>
        )}

        <div className="space-y-0.5 px-2">
          {SECTIONS.map((section) => {
            const Icon = ICON_MAP[section.icon] || Zap;
            const isActive = activeSection === section.id;
            const done = hasData(section.id);
            const gradClass = SECTION_COLORS[section.id];

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                title={!sidebarOpen ? section.label : ''}
                className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-white/[0.07] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }
                  ${isActive ? 'active' : ''}
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-gradient-to-b ${gradClass}`} />
                )}

                {/* Icon */}
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all
                  ${isActive
                    ? `bg-gradient-to-br ${gradClass} shadow-lg`
                    : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                </div>

                {/* Label */}
                {sidebarOpen && (
                  <span className="flex-1 text-sm font-medium truncate">{section.label}</span>
                )}

                {/* Done badge */}
                {sidebarOpen && done && (
                  <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </span>
                )}

                {/* Active chevron */}
                {sidebarOpen && isActive && !done && (
                  <ChevronRight size={14} className="shrink-0 text-slate-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-white/[0.06] shrink-0`}>
        <div className={`flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.03] ${!sidebarOpen && 'justify-center'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse shrink-0" />
          {sidebarOpen && (
            <span className="text-slate-500 text-[11px]">v1.0.0 · API Ready</span>
          )}
        </div>
      </div>
    </aside>
  );
}
