import { useApp } from '../../hooks/useAppContext';
import { SECTIONS } from '../../constants/appConfig';
import {
  Zap, Search, Activity, TrendingUp, FileText, LayoutGrid,
  ChevronRight, Menu
} from 'lucide-react';

const ICON_MAP = {
  zap: Zap,
  search: Search,
  activity: Activity,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'layout-grid': LayoutGrid,
};

export default function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen, result } = useApp();

  const hasData = (section) => {
    if (!result) return false;
    const map = {
      keywords: !!result.keyword_analysis,
      serp: !!result.gap,
      prediction: !!result.prediction,
      blogs: result.blogs?.length > 0,
      insight: !!result.blogy_analysis,
    };
    return map[section] ?? false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      <aside
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16'}
          bg-[#0d0d16] border-r border-white/8`}
      >
      {/* Logo & Toggle Header */}
      <div className={`flex items-center h-16 border-b border-white/8 shrink-0 ${sidebarOpen ? 'px-5 justify-between' : 'justify-center'}`}>

        {/* Left side: Minimal Logo & Text */}
        {sidebarOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-7 h-7 rounded bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-slate-200" />
            </div>
            <div className="overflow-hidden">
              <span className="text-slate-200 font-semibold text-sm tracking-wide leading-none flex items-center">
                QuillNexus
                <span className="text-slate-400 text-[10px] ml-1.5 border border-white/10 px-1 py-0.5 rounded uppercase">AI</span>
              </span>
            </div>
          </div>
        )}

        {/* Toggle Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all shrink-0"
          title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-3 mt-6">
        {SECTIONS.map((section) => {
          const Icon = ICON_MAP[section.icon] || Zap;
          const isActive = activeSection === section.id;
          const done = hasData(section.id);

          return (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              title={!sidebarOpen ? section.label : ''}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors duration-150 group
                ${isActive
                  ? 'bg-white/8 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/3'
                }`}
            >
              {/* Minimal Icon */}
              <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'} />
              </div>

              {/* Label */}
              {sidebarOpen && (
                <span className={`flex-1 text-sm truncate ${isActive ? 'font-medium' : 'font-normal'}`}>
                  {section.label}
                </span>
              )}

              {/* Minimal Done dot */}
              {sidebarOpen && done && (
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}

              {/* Active chevron */}
              {sidebarOpen && isActive && !done && (
                <ChevronRight size={14} className="shrink-0 text-slate-500" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
    </>
  );
}
