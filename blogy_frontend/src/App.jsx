import { useApp } from './hooks/useAppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import GenerateSection from './components/sections/GenerateSection';
import KeywordsSection from './components/sections/KeywordsSection';
import SerpSection from './components/sections/SerpSection';
import PredictionSection from './components/sections/PredictionSection';
import BlogsSection from './components/sections/BlogsSection';
import InsightSection from './components/sections/NexusSection';

const SECTION_MAP = {
  generate: GenerateSection,
  keywords: KeywordsSection,
  serp: SerpSection,
  prediction: PredictionSection,
  blogs: BlogsSection,
  insight: InsightSection,
};

export default function App() {
  const { activeSection, sidebarOpen } = useApp();
  const ActiveComponent = SECTION_MAP[activeSection] || GenerateSection;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <Sidebar />
      <TopBar />
      <main
        className={`min-h-screen transition-all duration-300 relative z-10 pt-16 pl-0 md:pl-16 ${sidebarOpen ? 'md:pl-64' : ''}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <ActiveComponent key={activeSection} />
        </div>
      </main>
    </div>
  );
}
