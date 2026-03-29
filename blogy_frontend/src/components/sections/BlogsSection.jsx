import { useState } from 'react';
import { useApp } from '../../hooks/useAppContext';
import EmptyState from '../ui/EmptyState';
import BlogModal from '../ui/BlogModal';
import ScoreRing from '../ui/ScoreRing';
import {
  Eye, Copy, CheckSquare
} from 'lucide-react';

const PLATFORM_CONFIG = {
  medium: { label: 'Medium', icon: '📝', color: 'from-green-500/20 to-emerald-500/10 border-green-500/25 text-green-300' },
  linkedin: { label: 'LinkedIn', icon: '💼', color: 'from-blue-600/20 to-sky-500/10 border-blue-500/25 text-blue-300' },
  wordpress: { label: 'WordPress', icon: '🌐', color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/25 text-indigo-300' },
  devto: { label: 'Dev.to', icon: '⚡', color: 'from-slate-500/20 to-gray-500/10 border-slate-500/25 text-slate-300' },
  hashnode: { label: 'Hashnode', icon: '#️⃣', color: 'from-blue-400/20 to-cyan-400/10 border-blue-400/25 text-cyan-300' },
};

export default function BlogsSection() {
  const { result } = useApp();
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const blogs = result?.blogs;
  if (!blogs?.length) return <EmptyState icon="✍️" text="Generate a blog first to see your content" />;

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
    <div className="space-y-6 animate-fade-in">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-violet-300 mb-1">{blogs.length}</div>
          <div className="text-slate-500 text-xs">Blogs Generated</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-blue-300 mb-1">5</div>
          <div className="text-slate-500 text-xs">Export Platforms</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-3xl font-black text-emerald-300 mb-1">
            {blogs.filter(b => b.seo_score).length}
          </div>
          <div className="text-slate-500 text-xs">SEO Validated</div>
        </div>
      </div>

      {/* Blog cards */}
      <div className="space-y-5">
        {blogs.map((blog, idx) => {
          const seo = blog.seo_score;
          const hasPlatforms = blog.platform_formats && Object.keys(blog.platform_formats).length > 0;
          const activePlatform = selectedPlatform[blog.title];
          const contentToCopy = getBlogContent(blog);
          const wordCount = blog.content?.split(/\s+/).length ?? 0;

          const BLOG_COLORS = [
            'from-violet-500/15 to-purple-500/5 border-violet-500/25',
            'from-blue-500/15 to-indigo-500/5 border-blue-500/25',
            'from-orange-500/15 to-amber-500/5 border-orange-500/25',
          ];

          return (
            <div key={idx}
              className={`glass-card rounded-2xl border bg-gradient-to-br ${BLOG_COLORS[idx % 3]} overflow-hidden`}
            >
              {/* Blog card header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Blog {idx + 1}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[10px] text-slate-500">{wordCount.toLocaleString()} words</span>
                    </div>
                    <h3 className="text-white font-bold text-base leading-tight line-clamp-2">{blog.title}</h3>
                  </div>
                  {seo && (
                    <div className="shrink-0">
                      <ScoreRing value={seo.seo_score} max={100} size={64} small />
                    </div>
                  )}
                </div>

                {/* SEO metrics row */}
                {seo && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <SEOBadge label="Readability" value={`${seo.readability_score}`} good={seo.readability_score >= 60} />
                    <SEOBadge label="AI Detection" value={`${seo.ai_detection_score}%`} good={seo.ai_detection_score <= 20} lower />
                    <SEOBadge label="Humanization" value={`${seo.humanization_score}%`} good={seo.humanization_score >= 70} />
                    <SEOBadge label="KW Density" value={`${seo.keyword_density?.toFixed(1)}%`} good={seo.keyword_density <= 2} lower />
                    {seo.snippet_readiness && (
                      <SEOBadge label="Featured Snippet" value="Ready" good={true} />
                    )}
                  </div>
                )}

                {/* Platform tabs */}
                {hasPlatforms && (
                  <div className="mb-4">
                    <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-2">Export Format:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedPlatform(p => ({ ...p, [blog.title]: null }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                          ${!activePlatform ? 'bg-white/[0.12] text-white border border-white/20' : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:border-white/[0.12]'}`}
                      >
                        Original
                      </button>
                      {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                        blog.platform_formats?.[key] ? (
                          <button
                            key={key}
                            onClick={() => setSelectedPlatform(p => ({ ...p, [blog.title]: key }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                              ${activePlatform === key ? cfg.color + ' border-opacity-60' : 'bg-white/[0.04] text-slate-500 border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300'}`}
                          >
                            {cfg.icon} {cfg.label}
                          </button>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                {/* Content preview */}
                <div className="bg-black/20 rounded-xl p-4 mb-4 max-h-36 overflow-y-auto">
                  <pre className="text-slate-400 text-xs leading-relaxed font-sans whitespace-pre-wrap line-clamp-5">
                    {contentToCopy?.slice(0, 400)}…
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBlog({ blog, platform: activePlatform })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white text-sm border border-white/[0.08] transition-all"
                  >
                    <Eye size={14} />
                    Read Full Blog
                  </button>
                  <button
                    onClick={() => handleCopy(contentToCopy, `${idx}-${activePlatform}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white text-sm border border-white/[0.08] transition-all"
                  >
                    {copiedId === `${idx}-${activePlatform}` ? (
                      <><CheckSquare size={14} className="text-emerald-400" /> Copied!</>
                    ) : (
                      <><Copy size={14} /> Copy</>
                    )}
                  </button>
                </div>
              </div>

              {/* Featured snippet indicator */}
              {seo?.featured_snippet && (
                <div className="px-5 pb-4">
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                    <div className="text-violet-300 text-xs font-semibold mb-1">⭐ Featured Snippet Target</div>
                    <p className="text-slate-400 text-xs leading-relaxed">{seo.featured_snippet.slice(0, 120)}…</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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

function SEOBadge({ label, value, good, lower }) {
  const isGood = lower ? good : good;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border
      ${isGood ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-red-500/10 border-red-500/25 text-red-300'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
