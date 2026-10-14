import React from 'react';
import { X, Check, AlertCircle, Sparkles, Scale, GraduationCap, Briefcase, Award } from 'lucide-react';
import { Candidate, CandidateMatch } from '../types';
import { MatchScoreBadge } from './MatchScoreBadge';

interface CompareItem {
  candidate: Candidate;
  match?: CandidateMatch | null;
}

interface CandidateCompareModalProps {
  items: CompareItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({ items, isOpen, onClose }) => {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#E2E8F0] bg-gradient-to-r from-blue-50/60 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Candidate Matrix Comparison</h2>
              <p className="text-xs text-[#64748B]">Side-by-side screening comparison for {items.length} candidates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-44">
                  Criterion
                </th>
                {items.map(({ candidate, match }) => (
                  <th key={candidate.id} className="p-3 min-w-[240px]">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1E293B] truncate">{candidate.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-slate-600 border border-slate-200">
                          {candidate.candidate_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{candidate.department}</p>
                      <p className="text-[11px] text-blue-600 font-medium truncate">{candidate.college_name}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* AI Match Score */}
              <tr className="bg-blue-50/30">
                <td className="p-3 font-bold text-[#1E293B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  AI Match Score
                </td>
                {items.map(({ candidate, match }) => (
                  <td key={`score-${candidate.id}`} className="p-3">
                    {match ? (
                      <div className="flex items-center gap-2">
                        <MatchScoreBadge score={match.match_score} size="sm" />
                        <span className="font-bold text-blue-700">{Math.round(match.match_score)}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Not screened</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* CGPA */}
              <tr>
                <td className="p-3 font-bold text-[#1E293B] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  Academic CGPA
                </td>
                {items.map(({ candidate }) => (
                  <td key={`cgpa-${candidate.id}`} className="p-3">
                    <span className="font-bold text-slate-900 text-sm">{candidate.cgpa.toFixed(2)}</span>
                    <span className="text-slate-400 text-[10px] ml-1">/ 10.0</span>
                  </td>
                ))}
              </tr>

              {/* Matched Skills */}
              <tr>
                <td className="p-3 font-bold text-[#1E293B]">Matched Skills</td>
                {items.map(({ candidate, match }) => (
                  <td key={`ms-${candidate.id}`} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {match && match.matched_skills.length > 0 ? (
                        match.matched_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium"
                          >
                            {s} ✓
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Skill Gap */}
              <tr>
                <td className="p-3 font-bold text-[#1E293B]">Skill Gap</td>
                {items.map(({ candidate, match }) => (
                  <td key={`gap-${candidate.id}`} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {match && match.missing_skills.length > 0 ? (
                        match.missing_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-700 font-medium text-[11px]">No Gaps ✓</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Projects */}
              <tr>
                <td className="p-3 font-bold text-[#1E293B]">Projects</td>
                {items.map(({ candidate }) => (
                  <td key={`proj-${candidate.id}`} className="p-3">
                    <div className="space-y-1.5">
                      {candidate.projects && candidate.projects.length > 0 ? (
                        candidate.projects.map((p, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-semibold text-slate-800 block text-[11px]">{p.project_name}</span>
                            <span className="text-slate-500 line-clamp-2 text-[10px]">{p.description}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400">None listed</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Internships */}
              <tr>
                <td className="p-3 font-bold text-[#1E293B] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  Internships
                </td>
                {items.map(({ candidate }) => (
                  <td key={`exp-${candidate.id}`} className="p-3">
                    <div className="space-y-1">
                      {candidate.internships && candidate.internships.length > 0 ? (
                        candidate.internships.map((i, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="font-semibold text-slate-800 block text-[11px]">{i.company}</span>
                            <span className="text-slate-500 text-[10px]">{i.duration || 'Internship'}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Certifications */}
              <tr>
                <td className="p-3 font-bold text-[#1E293B] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  Certifications
                </td>
                {items.map(({ candidate }) => (
                  <td key={`cert-${candidate.id}`} className="p-3">
                    <div className="space-y-1">
                      {candidate.certifications && candidate.certifications.length > 0 ? (
                        candidate.certifications.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium mr-1 mb-1"
                          >
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
