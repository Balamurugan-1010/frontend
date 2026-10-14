import React from 'react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ score, size = 'md', showLabel = true }) => {
  const rounded = Math.round(score);

  // Curated color palette based on match tier
  let colorStyles = {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    ring: '#2563EB',
    badge: 'bg-[#2563EB]',
  };

  if (rounded >= 80) {
    colorStyles = {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
      ring: '#2563EB',
      badge: 'bg-[#2563EB]',
    };
  } else if (rounded >= 60) {
    colorStyles = {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      ring: '#0284C7',
      badge: 'bg-sky-600',
    };
  } else if (rounded >= 40) {
    colorStyles = {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      ring: '#F59E0B',
      badge: 'bg-amber-500',
    };
  } else {
    colorStyles = {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-600',
      ring: '#94A3B8',
      badge: 'bg-slate-500',
    };
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorStyles.bg} ${colorStyles.border} ${colorStyles.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colorStyles.badge}`} />
        <span>{rounded}%</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke={colorStyles.ring}
              strokeDasharray={`${rounded}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-black text-[#1E293B]">{rounded}%</span>
          </div>
        </div>
        {showLabel && (
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            AI Match Score
          </span>
        )}
      </div>
    );
  }

  // Size md
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${colorStyles.badge} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(5, rounded))}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${colorStyles.text}`}>
        {rounded}%
      </span>
    </div>
  );
};
