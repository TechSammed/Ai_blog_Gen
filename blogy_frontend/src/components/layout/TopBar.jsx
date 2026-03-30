import { useApp, SECTIONS } from '../../hooks/useAppContext';
import { Clock } from 'lucide-react';

const PIPELINE_STEPS_SHORT = ['Keywords', 'SERP', 'Predict', 'Generate', 'SEO', 'Export', 'Analysis'];

export default function TopBar() {
  const { activeSection, isLoading, pipelineStep, elapsedTime, sidebarOpen } = useApp();

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  const formatTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <header className="fixed top-0 right-0 z-30 h-16 flex items-center
      bg-[#0d0d16]/95 backdrop-blur-md border-b border-white/[0.08]
      transition-all duration-300"
      style={{ left: sidebarOpen ? '256px' : '64px' }}
    >
      <div className="flex items-center justify-between w-full px-6 gap-4">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Blogy</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200 text-sm font-medium">{currentSection?.label}</span>
          </div>
        </div>

        {/* Center: Pipeline progress */}
        {isLoading && (
          <div className="hidden md:flex items-center gap-1">
            {PIPELINE_STEPS_SHORT.map((step, i) => {
              const stepNum = i + 1;
              const isDone = pipelineStep >= stepNum;
              const isCurrent = pipelineStep === stepNum - 1 || (pipelineStep === 0 && stepNum === 1);

              return (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 mt-1">
                    {/* Minimalist dot indicator */}
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                      ${isDone ? 'bg-slate-300' : isCurrent ? 'bg-white ring-2 ring-white/20' : 'bg-slate-700'}`}
                    />
                    <span className={`text-[10px] leading-none font-medium
                      ${isDone ? 'text-slate-400' : isCurrent ? 'text-white' : 'text-slate-600'}`}>
                      {step}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS_SHORT.length - 1 && (
                    <div className={`w-6 h-[1px] mb-3 transition-colors duration-500
                      ${isDone ? 'bg-slate-500/50' : 'bg-white/[0.05]'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Right: Timer (Minimalist) */}
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-md">
              <Clock size={12} className="text-slate-400" />
              <span className="text-slate-300 text-xs font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}