import React, { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import BlogModal from '../ui/BlogModal';
import ScoreRing from '../ui/ScoreRing';
import {
  Eye, Copy, CheckSquare, PenLine, Award
} from 'lucide-react';

// Platform config without the icons
const PLATFORM_CONFIG = {
  medium: { label: 'Medium', activeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
  linkedin: { label: 'LinkedIn', activeClass: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
  wordpress: { label: 'WordPress', activeClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' },
  devto: { label: 'Dev.to', activeClass: 'text-zinc-300 border-zinc-500/30 bg-zinc-500/5' },
  hashnode: { label: 'Hashnode', activeClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5' },
};

export default function BlogsSection() {
  const { result } = useApp();
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const blogs = result?.blogs;

  if (!blogs?.length) return <EmptyState icon={<PenLine size={32} className="text-zinc-600 mb-4" />} text="Generate a blog first to see your content" />;

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBlogContent = (blog) => {
    const platform = selectedPlatform[blog.title];
    if (platform && blog.platform_formats?.[platform]) {
      return blog.platform_formats[platform];
    }
    return blog.content;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ─── Summary Row ─── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-4xl font-bold tracking-tight text-indigo-400 mb-1">{blogs.length}</div>
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Blogs Generated</div>
        </div>
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-4xl font-bold tracking-tight text-blue-400 mb-1">5</div>
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Export Platforms</div>
        </div>
        <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-4xl font-bold tracking-tight text-emerald-400 mb-1">
            {blogs.filter(b => b.seo_score).length}
          </div>
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">SEO Validated</div>
        </div>
      </div>

      {/* ─── Blog Cards ─── */}
      <div className="space-y-5">
        {blogs.map((blog, idx) => {
          const hasSeo = blog.seo_score > 0;
          const hasPlatforms = blog.platform_formats && Object.keys(blog.platform_formats).length > 0;
          const activePlatform = selectedPlatform[blog.title];
          const contentToCopy = getBlogContent(blog);
          const wordCount = blog.content?.split(/\s+/).length ?? 0;

          return (
            <div key={idx} className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shadow-sm group hover:border-white/10 transition-colors">

              {/* Blog Card Header */}
              <div className="p-6 pb-5">
                <div className="flex items-start justify-between gap-6 mb-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Blog 0{idx + 1}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-[11px] font-medium text-zinc-400">{wordCount.toLocaleString()} words</span>
                    </div>
                    <h3 className="text-zinc-100 font-bold text-lg leading-snug">{blog.title}</h3>
                  </div>
                  {hasSeo && (
                    <div className="shrink-0">
                      <ScoreRing value={blog.seo_score} max={100} />
                    </div>
                  )}
                </div>

                {/* SEO Metrics Row */}
                {hasSeo && (
                  <div className="flex flex-wrap gap-2.5 mb-6">
                    <SEOBadge label="Readability" value={`${blog.readability_score}`} good={blog.readability_score >= 60} />
                    <SEOBadge label="AI Detection" value={`${blog.ai_detection_score}%`} good={blog.ai_detection_score <= 20} />
                    <SEOBadge label="Humanization" value={`${blog.humanization_score}%`} good={blog.humanization_score >= 70} />
                    <SEOBadge label="KW Density" value={`${blog.keyword_density?.toFixed(1)}%`} good={blog.keyword_density <= 2} />
                    {blog.snippet_readiness && (
                      <SEOBadge label="Featured Snippet" value="Ready" good={true} />
                    )}
                  </div>
                )}

                {/* Platform Tabs (No Icons) */}
                {hasPlatforms && (
                  <div className="mb-6">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mb-3">Export Format</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedPlatform(p => ({ ...p, [blog.title]: null }))}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors border
                          ${!activePlatform ? 'bg-zinc-800 text-zinc-100 border-zinc-600' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-zinc-200'}`}
                      >
                        Original
                      </button>

                      {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                        return blog.platform_formats?.[key] ? (
                          <button
                            key={key}
                            onClick={() => setSelectedPlatform(p => ({ ...p, [blog.title]: key }))}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors border
                              ${activePlatform === key ? cfg.activeClass : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-zinc-200'}`}
                          >
                            {cfg.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 mb-5 max-h-40 overflow-y-auto">
                  <pre className="text-zinc-400 text-sm leading-relaxed font-sans whitespace-pre-wrap line-clamp-4">
                    {contentToCopy?.slice(0, 400)}…
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedBlog({ blog, platform: activePlatform })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors"
                  >
                    <Eye size={16} />
                    Read Full Blog
                  </button>
                  <button
                    onClick={() => handleCopy(contentToCopy, `${idx}-${activePlatform}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-white/10 transition-colors"
                  >
                    {copiedId === `${idx}-${activePlatform}` ? (
                      <><CheckSquare size={16} className="text-emerald-400" /> Copied</>
                    ) : (
                      <><Copy size={16} /> Copy Content</>
                    )}
                  </button>
                </div>
              </div>

              {/* Featured Snippet Indicator */}
              {blog.featured_snippet && (
                <div className="px-6 pb-6 pt-2">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex items-start gap-3">
                    <Award size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1.5">Featured Snippet Target</div>
                      <p className="text-zinc-400 text-sm leading-relaxed">{blog.featured_snippet.slice(0, 150)}…</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Blog Modal ─── */}
      {selectedBlog && (
        <BlogModal
          blog={selectedBlog.blog}
          platform={selectedBlog.platform}
          onClose={() => setSelectedBlog(null)}
        />
      )}
    </div>
  );
}

// Flat, Clean SEO Badge
function SEOBadge({ label, value, good }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium border
      ${good ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${good ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      <span className="text-zinc-500">{label}:</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}
