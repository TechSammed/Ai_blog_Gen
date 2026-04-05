/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { generateBlogStream, generateBlog } from '../api/blogApi';
import { PIPELINE_STEPS } from '../constants/appConfig';

const AppContext = createContext(null);

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

    // Elapsed time counter
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // ── Strategy 1: Real-time streaming (preferred) ──
      const data = await generateBlogStream(kw, (step) => {
        setPipelineStep(step);
      });
      clearInterval(timer);
      setPipelineStep(7);
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      setResult(data);
    } catch (streamErr) {
      console.warn('Streaming failed, falling back to non-streaming:', streamErr.message);

      // ── Strategy 2: Non-streaming fallback ──
      try {
        // Simulate progress since we can't get real events from non-streaming
        const stepDurations = [4000, 4000, 4000, 25000, 15000, 10000, 6000];
        let currentStep = 0;
        let stepTimer;
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

        const data = await generateBlog(kw);
        clearTimeout(stepTimer);
        clearInterval(timer);
        setPipelineStep(7);
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        setResult(data);
      } catch (fallbackErr) {
        clearInterval(timer);
        setError(fallbackErr.message || 'Something went wrong. Make sure the backend is running on port 8000.');
      }
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
