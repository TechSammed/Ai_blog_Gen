export default function ScoreRing({ value, max = 100, label, size = 'sm' }) {
  const isLarge = size === 'lg';
  const radius = isLarge ? 46 : 24;
  const stroke = isLarge ? 8 : 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / max) * circumference;

  const ringColor =
    value >= 80 ? 'text-emerald-500' :
      value >= 60 ? 'text-amber-500' : 'text-rose-500';

  if (isLarge) {
    return (
      <div className="flex flex-col h-full w-full">
        {label && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center relative">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle stroke="currentColor" fill="transparent" strokeWidth={stroke}
              r={normalizedRadius} cx={radius} cy={radius} className="text-zinc-800" />
            <circle stroke="currentColor" fill="transparent" strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }} strokeLinecap="round"
              r={normalizedRadius} cx={radius} cy={radius}
              className={`${ringColor} transition-all duration-1000 ease-out`} />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight text-zinc-100">{value}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Small variant (BlogsSection) ─── */
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 absolute inset-0">
        <circle stroke="currentColor" fill="transparent" strokeWidth={stroke}
          r={normalizedRadius} cx={radius} cy={radius} className="text-zinc-800" />
        <circle stroke="currentColor" fill="transparent" strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }} strokeLinecap="round"
          r={normalizedRadius} cx={radius} cy={radius}
          className={`${ringColor} transition-all duration-1000 ease-out`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-zinc-100">{value}</span>
      </div>
    </div>
  );
}
