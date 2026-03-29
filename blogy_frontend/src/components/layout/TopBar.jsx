import { useApp, SECTIONS } from '../../hooks/useAppContext';
import { Menu, Clock, Wifi } from 'lucide-react';

const PIPELINE_STEPS_SHORT = ['Keywords', 'SERP', 'Predict', 'Generate', 'SEO', 'Export', 'Analysis'];

export default function TopBar() {
  const { activeSection, isLoading, pipelineStep, elapsedTime, sidebarOpen, setSidebarOpen } = useApp();

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  const formatTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <header className="fixed top-0 right-0 z-30 h-16 flex items-center
      bg-[#0d0d16]/90 backdrop-blur-xl border-b border-white/[0.06]
      transition-all duration-300"
      style={{ left: sidebarOpen ? '256px' : '64px' }}
    >
      <div className="flex items-center justify-between w-full px-6 gap-4">
        {/* Left: Toggle + Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Blogy</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 text-sm font-medium">{currentSection?.label}</span>
          </div>
        </div>

        {/* Center: Pipeline progress (shown while loading) */}
        {isLoading && (
          <div className="hidden md:flex items-center gap-1">
            {PIPELINE_STEPS_SHORT.map((step, i) => {
              const stepNum = i + 1;
              const isDone = pipelineStep >= stepNum;
              const isCurrent = pipelineStep === stepNum - 1 || (pipelineStep === 0 && stepNum === 1);
              return (
                <div key={step} className="flex items-center gap-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`pipeline-step-dot ${isDone ? 'done' : isCurrent ? 'active' : ''}`} />
                    <span className={`text-[9px] leading-none font-medium
                      ${isDone ? 'text-emerald-400' : isCurrent ? 'text-violet-400' : 'text-slate-600'}`}>
                      {step}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS_SHORT.length - 1 && (
                    <div className={`w-6 h-px mb-4 transition-colors duration-500
                      ${isDone ? 'bg-emerald-500/50' : 'bg-white/[0.08]'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Right: Timer + API badge */}
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
              <Clock size={12} className="text-violet-400 animate-pulse" />
              <span className="text-violet-300 text-xs font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
            <Wifi size={12} className="text-emerald-400" />
            <span className="text-slate-400 text-xs">API Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
