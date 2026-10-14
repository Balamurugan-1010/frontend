import React, { useState } from 'react';
import {
  X,
  Download,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  FileText,
  User,
} from 'lucide-react';
import { Candidate, CandidateMatch } from '../types';
import { candidateService } from '../services/api';
import { MatchScoreBadge } from './MatchScoreBadge';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  match?: CandidateMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist?: (candidateId: number) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  match,
  isOpen,
  onClose,
  onShortlist,
}) => {
  if (!isOpen || !candidate) return null;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadResume = async () => {
    try {
      setIsDownloading(true);
      const blobData = await candidateService.downloadResume(candidate.id);
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const sanitizedName = candidate.name ? candidate.name.replace(/\s+/g, '_') : 'Candidate';
      link.setAttribute('download', `${candidate.candidate_code || 'Resume'}_${sanitizedName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error('Failed to download resume', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again as a manager to download candidate resumes.');
      } else {
        alert('Failed to download resume file. Please verify that the resume exists on storage.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#E2E8F0] bg-gradient-to-r from-blue-50/50 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#1E293B]">{candidate.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  {candidate.candidate_code}
                </span>
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
                <span>{candidate.department}</span>
                <span>•</span>
                <span className="font-semibold text-blue-600">{candidate.college_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {candidate.has_resume && (
              <button
                onClick={handleDownloadResume}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E2E8F0] text-[#1E293B] hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-[#2563EB]" />
                )}
                <span>{isDownloading ? 'Downloading...' : 'Download Resume PDF'}</span>
              </button>
            )}
            {onShortlist && (
              <button
                onClick={() => onShortlist(candidate.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors shadow-sm shadow-blue-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Shortlist</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-8 divide-y divide-slate-100">
          {/* AI Match Overview (if evaluated) */}
          {match && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-white border border-[#DBEAFE] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">AI Screening Assessment</h3>
                    <p className="text-xs text-[#64748B]">Multi-Factor Match Score Engine</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#64748B] block">Overall Score</span>
                    <span className="text-2xl font-black text-[#2563EB]">{Math.round(match.match_score)}%</span>
                  </div>
                  <MatchScoreBadge score={match.match_score} size="sm" />
                </div>
              </div>

              {/* Explainable AI block */}
              <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why this candidate matches:
                </span>
                <p className="text-xs leading-relaxed text-[#1E293B]">
                  {match.ai_explanation || 'Candidate matches required skill criteria and demonstrates academic eligibility.'}
                </p>

                {/* Score Factor Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Skills (40%)</span>
                    <span className="font-bold text-slate-800">{Math.round(match.skill_score)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">JD Sim (25%)</span>
                    <span className="font-bold text-slate-800">{Math.round(match.similarity_score)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Projects (15%)</span>
                    <span className="font-bold text-slate-800">{Math.round(match.project_score)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Internship (10%)</span>
                    <span className="font-bold text-slate-800">{Math.round(match.experience_score)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Education (10%)</span>
                    <span className="font-bold text-slate-800">{Math.round(match.education_score)}%</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic pt-1">
                  AI-generated recommendation. Final recruitment decisions are made by the recruiter.
                </p>
              </div>

              {/* Matched Skills vs Gap Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Matched Technical Skills ({match.matched_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.matched_skills.length > 0 ? (
                      match.matched_skills.map((s) => (
                        <span
                          key={`m-${s}`}
                          className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-[11px] font-medium"
                        >
                          {s} ✓
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None detected</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Identified Skill Gap ({match.missing_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.missing_skills.length > 0 ? (
                      match.missing_skills.map((s) => (
                        <span
                          key={`g-${s}`}
                          className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-700 text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium">None! Full skill coverage.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic & Contact Details */}
          <div className="pt-6 space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider text-slate-500">
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-xs text-[#64748B] flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <p className="text-xs font-semibold text-[#1E293B] truncate">{candidate.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-xs text-[#64748B] flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <p className="text-xs font-semibold text-[#1E293B]">{candidate.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-xs text-[#64748B] flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5" /> CGPA & Year
                </span>
                <p className="text-xs font-semibold text-[#1E293B]">
                  {candidate.cgpa.toFixed(2)} / 10.0 • Batch {candidate.graduation_year}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-xs text-[#64748B] flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5" /> Areas of Interest
                </span>
                <p className="text-xs font-semibold text-[#1E293B] truncate">
                  {candidate.areas_of_interest || 'Technology & Engineering'}
                </p>
              </div>
            </div>
          </div>

          {/* Skills Portfolio */}
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B]">All Extracted Technical Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills && candidate.skills.length > 0 ? (
                candidate.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No skills parsed yet.</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#2563EB]" />
              Projects Portfolio
            </h3>
            {candidate.projects && candidate.projects.length > 0 ? (
              <div className="space-y-3">
                {candidate.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-[#1E293B]">{proj.project_name}</h4>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No projects specified.</p>
            )}
          </div>

          {/* Internships & Work Experience */}
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2563EB]" />
              Internship & Practical Experience
            </h3>
            {candidate.internships && candidate.internships.length > 0 ? (
              <div className="space-y-3">
                {candidate.internships.map((intn, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1E293B]">{intn.company}</h4>
                      {intn.duration && (
                        <span className="text-[11px] font-medium text-slate-500">{intn.duration}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{intn.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No internship entries recorded.</p>
            )}
          </div>

          {/* Certifications */}
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              Certifications & Credentials
            </h3>
            {candidate.certifications && candidate.certifications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {candidate.certifications.map((cert, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">{cert.name}</h4>
                      {cert.issuer && <p className="text-[10px] text-[#64748B]">{cert.issuer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No certifications recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
