import { useApp } from '../../hooks/useAppContext';
import { SECTIONS } from '../../constants/appConfig';
import { Clock, Menu } from 'lucide-react';

const PIPELINE_STEPS_SHORT = ['Keywords', 'SERP', 'Predict', 'Generate', 'SEO', 'Export', 'Analysis'];

export default function TopBar() {
  const { activeSection, isLoading, pipelineStep, elapsedTime, sidebarOpen, setSidebarOpen } = useApp();

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  const formatTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 flex items-center bg-[#0d0d16]/95 backdrop-blur-md border-b border-white/8 transition-all duration-300 left-0 md:left-16 ${sidebarOpen ? 'md:left-64' : ''}`}
    >
      <div className="flex items-center justify-between w-full px-4 md:px-6 gap-4">
        {/* Left: Breadcrumb & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm hidden sm:inline">Blogy</span>
            <span className="text-slate-700 hidden sm:inline">/</span>
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
                    <div className={`w-6 h-px mb-3 transition-colors duration-500
                      ${isDone ? 'bg-slate-500/50' : 'bg-white/5'}`}
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
            <div className="flex items-center gap-1.5 bg-white/3 border border-white/8 px-3 py-1.5 rounded-md">
              <Clock size={12} className="text-slate-400" />
              <span className="text-slate-300 text-xs font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}