export default function ScoreRing({ value, max = 100, label, size = 120, small = false }) {
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 75) return { stroke: '#34d399', text: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.4)' };
    if (pct >= 55) return { stroke: '#fbbf24', text: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.4)' };
    return { stroke: '#f87171', text: 'text-red-400', glow: 'rgba(248, 113, 113, 0.4)' };
  };

  const { stroke, text } = getColor(pct);

  if (small) {
    return (
      <div className="flex flex-col items-center" title={label || 'SEO Score'}>
        <div className="score-ring" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle
              className="score-ring-bg"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={size * 0.08}
            />
            <circle
              className="score-ring-fill"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={size * 0.08}
              stroke={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: `drop-shadow(0 0 4px ${stroke})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-black leading-none ${text}`} style={{ fontSize: size * 0.22 }}>{value}</span>
            <span className="text-slate-600" style={{ fontSize: size * 0.12 }}>SEO</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            className="score-ring-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={size * 0.07}
          />
          <circle
            className="score-ring-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={size * 0.07}
            stroke={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: `drop-shadow(0 0 8px ${stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black leading-none ${text}`} style={{ fontSize: size * 0.26 }}>{value}</span>
          <span className="text-slate-500 text-xs mt-0.5">/100</span>
        </div>
      </div>
      {label && <p className="text-slate-400 text-xs text-center mt-2">{label}</p>}
    </div>
  );
}
