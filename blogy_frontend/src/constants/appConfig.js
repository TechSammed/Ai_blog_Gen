export const SECTIONS = [
  { id: 'generate', label: 'Generate Blog', icon: 'zap' },
  { id: 'keywords', label: 'Keyword Analysis', icon: 'search' },
  { id: 'serp', label: 'SERP Gap', icon: 'activity' },
  { id: 'prediction', label: 'Performance', icon: 'trending-up' },
  { id: 'blogs', label: 'Blogs', icon: 'file-text' },
  { id: 'blogy', label: 'Dashboard Analysis', icon: 'layout-grid' },
];

export const PIPELINE_STEPS = [
  { id: 1, label: 'Keyword Intelligence', key: 'keyword_analysis' },
  { id: 2, label: 'SERP Gap Analysis', key: 'gap' },
  { id: 3, label: 'Performance Prediction', key: 'prediction' },
  { id: 4, label: 'Blog Generation', key: 'blogs_raw' },
  { id: 5, label: 'SEO Validation', key: 'blogs_seo' },
  { id: 6, label: 'Platform Export', key: 'blogs' },
  { id: 7, label: 'Dashboard Analysis', key: 'blogy_analysis' },
];
