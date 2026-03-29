import { createContext, useContext, useState, useCallback } from 'react';
import { generateBlog } from '../api/blogApi';

const AppContext = createContext(null);

export const SECTIONS = [
  { id: 'generate', label: 'Generate Blog', icon: 'zap' },
  { id: 'keywords', label: 'Keyword Analysis', icon: 'search' },
  { id: 'serp', label: 'SERP Gap', icon: 'activity' },
  { id: 'prediction', label: 'Performance', icon: 'trending-up' },
  { id: 'blogs', label: 'Blogs', icon: 'file-text' },
  { id: 'blogy', label: 'Dashboard Analysis', icon: 'layout-grid' },
];

const PIPELINE_STEPS = [
  { id: 1, label: 'Keyword Intelligence', key: 'keyword_analysis' },
  { id: 2, label: 'SERP Gap Analysis', key: 'gap' },
  { id: 3, label: 'Performance Prediction', key: 'prediction' },
  { id: 4, label: 'Blog Generation', key: 'blogs_raw' },
  { id: 5, label: 'SEO Validation', key: 'blogs_seo' },
  { id: 6, label: 'Platform Export', key: 'blogs' },
  { id: 7, label: 'Dashboard Analysis', key: 'blogy_analysis' },
];

export function AppProvider({ children }) {
  const [activeSection, setActiveSection] = useState('generate');
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const generate = useCallback(async (kw) => {
    if (!kw.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPipelineStep(0);
    setElapsedTime(0);

    // Start a timer that simulates pipeline progress
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Simulate progressive pipeline steps
    const stepDurations = [4000, 4000, 4000, 25000, 15000, 10000, 6000];
    let stepTimer;
    let currentStep = 0;

    const advanceStep = () => {
      if (currentStep < 7) {
        currentStep++;
        setPipelineStep(currentStep);
        if (currentStep < 7) {
          stepTimer = setTimeout(advanceStep, stepDurations[currentStep] || 6000);
        }
      }
    };
    stepTimer = setTimeout(advanceStep, stepDurations[0]);

    try {
      const data = await generateBlog(kw);
      clearTimeout(stepTimer);
      clearInterval(timer);
      setPipelineStep(7);
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      setResult(data);
    } catch (err) {
      clearTimeout(stepTimer);
      clearInterval(timer);
      setError(err.message || 'Something went wrong. Make sure the backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const value = {
    activeSection,
    setActiveSection,
    keyword,
    setKeyword,
    isLoading,
    pipelineStep,
    result,
    error,
    setError,
    elapsedTime,
    sidebarOpen,
    setSidebarOpen,
    generate,
    PIPELINE_STEPS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
