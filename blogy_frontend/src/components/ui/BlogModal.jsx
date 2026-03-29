import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy, CheckSquare } from 'lucide-react';

const PLATFORM_CONFIG = {
  medium: { label: 'Medium', color: 'text-green-300 bg-green-500/10 border-green-500/25' },
  linkedin: { label: 'LinkedIn', color: 'text-blue-300 bg-blue-500/10 border-blue-500/25' },
  wordpress: { label: 'WordPress', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/25' },
  devto: { label: 'Dev.to', color: 'text-slate-300 bg-slate-500/10 border-slate-500/25' },
  hashnode: { label: 'Hashnode', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25' },
};

export default function BlogModal({ blog, platform: initialPlatform, onClose }) {
  const [activePlatform, setActivePlatform] = useState(initialPlatform || null);
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    if (activePlatform && blog.platform_formats?.[activePlatform]) {
      return blog.platform_formats[activePlatform];
    }
    return blog.content;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = getContent();
  const hasPlatforms = blog.platform_formats && Object.keys(blog.platform_formats).length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0f0f1a] border border-white/[0.10] rounded-2xl shadow-2xl shadow-black/60 animate-scale-in overflow-hidden">
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-white/[0.07] shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">{blog.title}</h2>
            <p className="text-slate-500 text-xs mt-1">
              {blog.content?.split(/\s+/).length?.toLocaleString()} words
              {blog.seo_score && ` · SEO Score: ${blog.seo_score.seo_score}/100`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs border border-white/[0.08] transition-all"
            >
              {copied ? <><CheckSquare size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-400 hover:text-white border border-white/[0.08] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Platform tabs */}
        {hasPlatforms && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.07] shrink-0 overflow-x-auto">
            <button
              onClick={() => setActivePlatform(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border
                ${!activePlatform ? 'bg-white/[0.12] text-white border-white/20' : 'bg-white/[0.04] text-slate-500 border-white/[0.06] hover:border-white/[0.12]'}`}
            >
              Original
            </button>
            {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
              blog.platform_formats?.[key] ? (
                <button
                  key={key}
                  onClick={() => setActivePlatform(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border
                    ${activePlatform === key ? cfg.color : 'bg-white/[0.04] text-slate-500 border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300'}`}
                >
                  {cfg.label}
                </button>
              ) : null
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 prose-blog">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* SEO metrics footer */}
        {blog.seo_score && (
          <div className="shrink-0 border-t border-white/[0.07] px-5 py-3 flex flex-wrap gap-3 bg-black/20">
            {[
              { label: 'SEO Score', val: `${blog.seo_score.seo_score}/100`, good: blog.seo_score.seo_score >= 70 },
              { label: 'Readability', val: blog.seo_score.readability_score, good: blog.seo_score.readability_score >= 60 },
              { label: 'AI Detection', val: `${blog.seo_score.ai_detection_score}%`, good: blog.seo_score.ai_detection_score <= 20 },
              { label: 'KW Density', val: `${blog.seo_score.keyword_density?.toFixed(2)}%`, good: blog.seo_score.keyword_density <= 2 },
              { label: 'Humanization', val: `${blog.seo_score.humanization_score}%`, good: blog.seo_score.humanization_score >= 70 },
            ].map(({ label, val, good }) => (
              <div key={label} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border
                ${good ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-red-500/10 border-red-500/25 text-red-300'}`}>
                <span className="text-slate-500">{label}:</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
