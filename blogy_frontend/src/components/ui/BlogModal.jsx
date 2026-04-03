import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy, CheckSquare, Download, PenLine, Eye } from 'lucide-react';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState({});

  const getContent = () => {
    const platformKey = activePlatform || 'original';
    if (editedContent[platformKey] !== undefined) {
      return editedContent[platformKey];
    }
    if (activePlatform && blog.platform_formats?.[activePlatform]) {
      return blog.platform_formats[activePlatform];
    }
    return blog.content;
  };

  const handleEditChange = (e) => {
    const platformKey = activePlatform || 'original';
    setEditedContent((prev) => ({ ...prev, [platformKey]: e.target.value }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const contentToDownload = getContent();
    const platformSuffix = activePlatform ? `-${activePlatform}` : '';
    const safeTitle = blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeTitle}${platformSuffix}.md`;
    
    const blob = new Blob([contentToDownload], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const content = getContent();
  const hasPlatforms = blog.platform_formats && Object.keys(blog.platform_formats).length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-[#050508]/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl h-[85vh] sm:h-[82vh] flex flex-col bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/[0.08] ring-1 ring-white/[0.02] rounded-3xl shadow-[0_30px_80px_-15px_rgba(0,0,0,1)] animate-scale-in overflow-hidden">
        {/* Modal header */}
        <div className="flex items-start justify-between gap-6 p-6 md:px-8 border-b border-white/[0.06] shrink-0 bg-white/[0.01]">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">{blog.title}</h2>
            <p className="text-slate-500 text-xs mt-1">
              {blog.content?.split(/\s+/).length?.toLocaleString()} words
              {blog.seo_score > 0 && ` · SEO Score: ${blog.seo_score}/100`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                isEditing
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30'
                  : 'bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/[0.08]'
              }`}
            >
              {isEditing ? <><Eye size={12} /> Preview</> : <><PenLine size={12} /> Edit</>}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs border border-white/[0.08] transition-all"
            >
              {copied ? <><CheckSquare size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs border border-white/[0.08] transition-all"
              title="Download as Markdown"
            >
              <Download size={12} /> Download
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
        {isEditing ? (
          <div className="flex-1 flex overflow-hidden">
            <textarea
              className="flex-1 w-full p-6 md:px-8 bg-transparent border-none text-slate-300 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-indigo-500/30"
              value={content}
              onChange={handleEditChange}
              spellCheck="false"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 md:px-8 prose-blog bg-transparent">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {/* SEO metrics footer */}
        {blog.seo_score > 0 && (
          <div className="shrink-0 border-t border-white/[0.07] px-5 py-3 flex flex-wrap gap-3 bg-black/20">
            {[
              { label: 'SEO Score', val: `${blog.seo_score}/100`, good: blog.seo_score >= 70 },
              { label: 'Readability', val: blog.readability_score, good: blog.readability_score >= 60 },
              { label: 'AI Detection', val: `${blog.ai_detection_score}%`, good: blog.ai_detection_score <= 20 },
              { label: 'KW Density', val: `${blog.keyword_density?.toFixed(2)}%`, good: blog.keyword_density <= 2 },
              { label: 'Humanization', val: `${blog.humanization_score}%`, good: blog.humanization_score >= 70 },
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
