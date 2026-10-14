import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Users,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Scale,
  Download,
  FileDown,
  Filter,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  Search,
  ArrowUpDown,
  Info,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import {
  candidateService,
  collegeService,
  jobRoleService,
  matchingService,
  shortlistService,
  documentService,
} from '../services/api';
import { Candidate, College, JobRole, CandidateMatch } from '../types';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { SkillGapBadge } from '../components/SkillGapBadge';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { CandidateCompareModal } from '../components/CandidateCompareModal';
import { SearchableCollegeDropdown } from '../components/SearchableCollegeDropdown';

export const ManagerCandidatesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCollegeId = searchParams.get('college_id');

  const [colleges, setColleges] = useState<College[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(initialCollegeId || '');
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<string>('');

  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Filters
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection for comparison & bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [activeCandidateDetail, setActiveCandidateDetail] = useState<{
    candidate: Candidate;
    match?: CandidateMatch | null;
  } | null>(null);
  const [compareItems, setCompareItems] = useState<{ candidate: Candidate; match?: CandidateMatch }[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Document / PDF generation state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Toast / feedback alert
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleGeneratePdf = async () => {
    if (selectedIds.length === 0) {
      setAlertMsg({ text: 'Please select at least one candidate.', type: 'error' });
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setAlertMsg(null);
      const blobData = await documentService.generateShortlistPdf(
        selectedJobRoleId ? parseInt(selectedJobRoleId) : null,
        selectedIds
      );

      // Trigger automatic browser download
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'TalentMatch_Shortlisted_Candidates.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setAlertMsg({
        text: `PDF report successfully generated and downloaded for ${selectedIds.length} candidate(s)!`,
        type: 'success',
      });
    } catch (err: any) {
      let errMsg = 'Failed to generate PDF.';
      if (err.response?.status === 401) {
        errMsg = 'Your session has expired. Please log in again to export documents.';
      } else if (err.response && err.response.data) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            if (parsed.detail) errMsg = parsed.detail;
          } catch (_) {}
        } else if (err.response.data.detail) {
          errMsg = err.response.data.detail;
        }
      }
      setAlertMsg({ text: errMsg, type: 'error' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Load colleges and job roles on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [cData, rData] = await Promise.all([
          collegeService.getAll(),
          jobRoleService.getAll(),
        ]);
        setColleges(cData);
        setJobRoles(rData);

        if (initialCollegeId) {
          setSelectedCollegeId(initialCollegeId);
        } else if (cData.length > 0) {
          setSelectedCollegeId(cData[0].id.toString());
        }

        if (rData.length > 0) {
          setSelectedJobRoleId(rData[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load initial filters', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    init();
  }, [initialCollegeId]);

  // Run AI matching when filters change or button clicked
  const handleRunScreening = async () => {
    if (!selectedJobRoleId) {
      setAlertMsg({ text: 'Please select a job role to run screening.', type: 'error' });
      return;
    }

    try {
      setIsScreening(true);
      setAlertMsg(null);
      const results = await matchingService.run({
        job_role_id: parseInt(selectedJobRoleId),
        college_id: selectedCollegeId ? parseInt(selectedCollegeId) : undefined,
        only_eligible: onlyEligible,
      });
      setMatches(results);
      setSelectedIds([]);
      setAlertMsg({
        text: `AI Screening complete! Ranked ${results.length} candidates using TF-IDF and weighted skill matching.`,
        type: 'success',
      });
    } catch (err: any) {
      setAlertMsg({ text: 'Failed to run AI screening. Please check server status.', type: 'error' });
    } finally {
      setIsScreening(false);
    }
  };

  // Run initial matching automatically once filters are populated
  useEffect(() => {
    if (selectedJobRoleId && !loadingInitial && matches.length === 0) {
      handleRunScreening();
    }
  }, [selectedJobRoleId, selectedCollegeId, loadingInitial]);

  // Bulk Shortlist
  const handleBulkShortlist = async () => {
    if (selectedIds.length === 0 || !selectedJobRoleId) return;
    try {
      await shortlistService.create(parseInt(selectedJobRoleId), selectedIds);
      setAlertMsg({
        text: `Successfully shortlisted ${selectedIds.length} candidate(s)!`,
        type: 'success',
      });
      // Refresh list to update badges
      handleRunScreening();
    } catch (err) {
      setAlertMsg({ text: 'Failed to shortlist selected candidates.', type: 'error' });
    }
  };

  // Single Shortlist
  const handleSingleShortlist = async (candidateId: number) => {
    if (!selectedJobRoleId) return;
    try {
      await shortlistService.create(parseInt(selectedJobRoleId), [candidateId]);
      setAlertMsg({
        text: `Candidate successfully shortlisted!`,
        type: 'success',
      });
      handleRunScreening();
    } catch (err) {
      setAlertMsg({ text: 'Failed to shortlist candidate.', type: 'error' });
    }
  };

  // Compare selected (2 to 4 candidates)
  const handleLaunchComparison = async () => {
    if (selectedIds.length < 2 || selectedIds.length > 4) {
      setAlertMsg({
        text: 'Please select between 2 and 4 candidates to compare side-by-side.',
        type: 'error',
      });
      return;
    }

    try {
      const data = await matchingService.compare(parseInt(selectedJobRoleId), selectedIds);
      setCompareItems(data);
      setIsCompareOpen(true);
    } catch (err) {
      setAlertMsg({ text: 'Failed to generate comparison matrix.', type: 'error' });
    }
  };

  // View Candidate Details Modal
  const handleViewCandidate = async (matchItem: CandidateMatch) => {
    try {
      const fullCand = await candidateService.getById(matchItem.candidate_id);
      setActiveCandidateDetail({ candidate: fullCand, match: matchItem });
    } catch (err) {
      alert('Could not fetch candidate details');
    }
  };

  // Filter candidates by search term
  const filteredMatches = matches.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.candidate_name.toLowerCase().includes(q) ||
      m.candidate_code.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.college_name.toLowerCase().includes(q)
    );
  });

  const allFilteredSelected =
    filteredMatches.length > 0 &&
    filteredMatches.every((m) => selectedIds.includes(m.candidate_id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMatches.map((m) => m.candidate_id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="Candidate Ranking & AI Screening"
          subtitle="Screen eligible students, analyze skill gaps, and rank by multi-factor AI match score"
          actions={
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || selectedIds.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Generate PDF ({selectedIds.length})</span>
                </>
              )}
            </button>
          }
        />

        <main className="p-8 space-y-6 max-w-7xl">
          {/* Screening Control Panel */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* College Filter */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                  <span>Target College / Campus</span>
                </label>
                <SearchableCollegeDropdown
                  colleges={colleges}
                  selectedCollegeId={selectedCollegeId}
                  onChange={(collegeId) => setSelectedCollegeId(collegeId)}
                  inputClassName="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2563EB] bg-white text-slate-800 cursor-pointer"
                />
              </div>

              {/* Job Role Filter */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#2563EB]" />
                  <span>Target Job Role Requirement</span>
                </label>
                <select
                  value={selectedJobRoleId}
                  onChange={(e) => setSelectedJobRoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2563EB] bg-white text-slate-800"
                >
                  {jobRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name} ({r.company_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <div className="flex items-end">
                <button
                  onClick={handleRunScreening}
                  disabled={isScreening}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isScreening ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Computing TF-IDF & Scoring...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI Screening & Ranking</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sub-bar: Search, Eligibility Toggle, & Selected Counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search candidate name, ID, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {/* Toggle Only Eligible */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={onlyEligible}
                    onChange={(e) => {
                      setOnlyEligible(e.target.checked);
                      handleRunScreening();
                    }}
                    className="w-4 h-4 text-[#2563EB] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Show Only Eligible Candidates</span>
                </label>

                {/* Compare Button */}
                {selectedIds.length >= 2 && selectedIds.length <= 4 && (
                  <button
                    onClick={handleLaunchComparison}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare ({selectedIds.length})</span>
                  </button>
                )}

                {/* Bulk Shortlist Button */}
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkShortlist}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Shortlist Selected ({selectedIds.length})</span>
                  </button>
                )}

                {/* Generate PDF Button */}
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Generate PDF ({selectedIds.length})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Alert */}
          {alertMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 border ${
                alertMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{alertMsg.text}</span>
              </div>
              <button
                onClick={() => setAlertMsg(null)}
                className="text-xs font-bold opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Candidate Ranking Table */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] subtle-shadow overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Candidate Screening Rankings</h3>
                <p className="text-xs text-[#64748B]">
                  Ranked by multi-factor score: Skills (40%), JD Similarity (25%), Projects (15%), Experience (10%), Education (10%)
                </p>
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {filteredMatches.length} Candidate(s) Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-[#2563EB] rounded focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4 min-w-[200px]">Candidate Name</th>
                    <th className="p-4">College & Dept</th>
                    <th className="p-4 w-20 text-center">CGPA</th>
                    <th className="p-4 min-w-[140px]">AI Match Score</th>
                    <th className="p-4 min-w-[220px]">Skill Gap Analysis</th>
                    <th className="p-4 w-28 text-center">Status</th>
                    <th className="p-4 w-32 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((item, idx) => {
                      const rankNum = idx + 1;
                      const isSelected = selectedIds.includes(item.candidate_id);

                      return (
                        <tr
                          key={item.candidate_id}
                          className={`hover:bg-blue-50/30 transition-colors ${
                            isSelected ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(item.candidate_id)}
                              className="w-4 h-4 text-[#2563EB] rounded focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Rank */}
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                                rankNum === 1
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : rankNum === 2
                                  ? 'bg-slate-200 text-slate-800'
                                  : rankNum === 3
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'text-slate-500'
                              }`}
                            >
                              #{rankNum}
                            </span>
                          </td>

                          {/* Candidate Name & Code */}
                          <td className="p-4">
                            <div className="font-bold text-[#1E293B] hover:text-[#2563EB] cursor-pointer"
                              onClick={() => handleViewCandidate(item)}
                            >
                              {item.candidate_name}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.candidate_code}
                            </span>
                          </td>

                          {/* College & Department */}
                          <td className="p-4">
                            <p className="text-xs text-slate-700 font-medium truncate max-w-[200px]">
                              {item.department}
                            </p>
                            <p className="text-[10px] text-blue-600 truncate max-w-[200px]">
                              {item.college_name}
                            </p>
                          </td>

                          {/* CGPA */}
                          <td className="p-4 text-center font-bold text-slate-800">
                            {item.cgpa.toFixed(2)}
                          </td>

                          {/* Match Score */}
                          <td className="p-4">
                            <MatchScoreBadge score={item.match_score} />
                          </td>

                          {/* Skill Gap Analysis */}
                          <td className="p-4">
                            <SkillGapBadge
                              matchedSkills={item.matched_skills}
                              missingSkills={item.missing_skills}
                            />
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'Shortlisted'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'Assessment'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : item.status === 'Interview'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : item.status === 'Selected'
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : item.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewCandidate(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-slate-100 transition-colors"
                                title="View Full Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleSingleShortlist(item.candidate_id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Shortlist Candidate"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                        {isScreening
                          ? 'Evaluating candidate resumes with AI algorithms...'
                          : 'No candidates matched the current filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Candidate detail drawer */}
      <CandidateDetailModal
        candidate={activeCandidateDetail?.candidate || null}
        match={activeCandidateDetail?.match}
        isOpen={!!activeCandidateDetail}
        onClose={() => setActiveCandidateDetail(null)}
        onShortlist={(cId) => {
          handleSingleShortlist(cId);
          setActiveCandidateDetail(null);
        }}
      />

      {/* Candidate compare matrix modal */}
      <CandidateCompareModal
        items={compareItems}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
};
