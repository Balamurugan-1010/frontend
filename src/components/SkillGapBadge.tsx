import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface SkillGapBadgeProps {
  matchedSkills: string[];
  missingSkills: string[];
  maxDisplay?: number;
}

export const SkillGapBadge: React.FC<SkillGapBadgeProps> = ({
  matchedSkills,
  missingSkills,
  maxDisplay = 4,
}) => {
  const visibleMatched = matchedSkills.slice(0, maxDisplay);
  const remainingMatched = matchedSkills.length - maxDisplay;

  const visibleMissing = missingSkills.slice(0, maxDisplay);
  const remainingMissing = missingSkills.length - maxDisplay;

  return (
    <div className="space-y-1.5 text-xs">
      {/* Matched skills */}
      {matchedSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {visibleMatched.map((skill) => (
            <span
              key={`match-${skill}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]"
            >
              <span>{skill}</span>
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            </span>
          ))}
          {remainingMatched > 0 && (
            <span className="text-[10px] text-emerald-600 font-semibold px-1">
              +{remainingMatched} more
            </span>
          )}
        </div>
      )}

      {/* Missing skills (Gap) */}
      {missingSkills.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mr-1">
            Gap:
          </span>
          {visibleMissing.map((skill) => (
            <span
              key={`gap-${skill}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 font-medium text-[10px]"
            >
              <span>{skill}</span>
            </span>
          ))}
          {remainingMissing > 0 && (
            <span className="text-[10px] text-rose-500 font-semibold px-0.5">
              +{remainingMissing}
            </span>
          )}
        </div>
      ) : (
        <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Full match (No skill gap)</span>
        </div>
      )}
    </div>
  );
};
