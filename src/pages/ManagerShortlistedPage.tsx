import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileDown,
  Filter,
  Trash2,
  Loader2,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import { shortlistService, collegeService, jobRoleService, documentService, triggerBlobDownload } from '../services/api';
import { ShortlistEntry, College, JobRole } from '../types';

export const ManagerShortlistedPage: React.FC = () => {
  const [shortlists, setShortlists] = useState<ShortlistEntry[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected candidates for DOCX export
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);

  // Document generation state
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);
  const [docFilename, setDocFilename] = useState<string>('');
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, cData, rData] = await Promise.all([
        shortlistService.getAll({
          job_role_id: selectedJobRoleId ? parseInt(selectedJobRoleId) : undefined,
          college_id: selectedCollegeId ? parseInt(selectedCollegeId) : undefined,
          status_filter: statusFilter !== 'All' ? statusFilter : undefined,
        }),
        collegeService.getAll(),
        jobRoleService.getAll(),
      ]);
      setShortlists(sData);
      setColleges(cData);
      setJobRoles(rData);
      if (!selectedJobRoleId && rData.length > 0) {
        setSelectedJobRoleId(rData[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load shortlists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJobRoleId, selectedCollegeId, statusFilter]);

  const handleStatusChange = async (shortlistId: number, newStatus: string) => {
    try {
      await shortlistService.updateStatus(shortlistId, newStatus);
      setShortlists((prev) =>
        prev.map((item) => (item.id === shortlistId ? { ...item, status: newStatus as any } : item))
      );
      setAlertMsg({ text: `Recruitment stage updated to "${newStatus}"`, type: 'success' });
    } catch (err) {
      setAlertMsg({ text: 'Failed to update recruitment status', type: 'error' });
    }
  };

  const handleDeleteShortlist = async (shortlistId: number) => {
    if (window.confirm('Remove candidate from shortlisted pool?')) {
      try {
        await shortlistService.delete(shortlistId);
        setShortlists(shortlists.filter((s) => s.id !== shortlistId));
        setAlertMsg({ text: 'Candidate removed from shortlist', type: 'success' });
      } catch (err) {
        setAlertMsg({ text: 'Failed to remove shortlist entry', type: 'error' });
      }
    }
  };

  // Authenticated download for generated Word Document
  const handleDownloadReadyDocx = async (filename: string) => {
    if (!filename) return;
    try {
      setIsDownloadingDoc(true);
      const blobData = await documentService.downloadShortlistDocx(filename);
      triggerBlobDownload(
        blobData,
        filename,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAlertMsg({ text: 'Your session has expired. Please log in again as a manager.', type: 'error' });
      } else {
        setAlertMsg({ text: 'Failed to download Word document. Please try again.', type: 'error' });
      }
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  // Generate Word Document with Authenticated Download
  const handleGenerateWordDoc = async () => {
    if (selectedCandidateIds.length === 0) {
      setAlertMsg({ text: 'Please select at least 1 candidate to export to Word document.', type: 'error' });
      return;
    }
    if (!selectedJobRoleId) {
      setAlertMsg({ text: 'Please choose an active job role for the report.', type: 'error' });
      return;
    }

    try {
      setIsGeneratingDoc(true);
      setAlertMsg(null);
      const res = await documentService.generateShortlistDocx(
        parseInt(selectedJobRoleId),
        selectedCandidateIds,
        true
      );
      setGeneratedDocUrl(res.download_url);
      setDocFilename(res.filename);

      // Authenticated blob download (sends Bearer Authorization header)
      const blobData = await documentService.downloadShortlistDocx(res.filename);
      triggerBlobDownload(
        blobData,
        res.filename,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      setAlertMsg({
        text: `Word document successfully generated and downloaded for ${res.candidate_count} shortlisted candidate(s)!`,
        type: 'success',
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAlertMsg({ text: 'Your session has expired. Please log in again to export documents.', type: 'error' });
      } else {
        setAlertMsg({ text: 'Failed to generate Word document.', type: 'error' });
      }
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Generate PDF Document with Authenticated Download
  const handleGeneratePdf = async () => {
    if (selectedCandidateIds.length === 0) {
      setAlertMsg({ text: 'Please select at least 1 candidate to export to PDF.', type: 'error' });
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setAlertMsg(null);
      const blobData = await documentService.generateShortlistPdf(
        selectedJobRoleId ? parseInt(selectedJobRoleId) : null,
        selectedCandidateIds
      );

      triggerBlobDownload(blobData, 'TalentMatch_Shortlisted_Candidates.pdf', 'application/pdf');

      setAlertMsg({
        text: `PDF report successfully generated and downloaded for ${selectedCandidateIds.length} candidate(s)!`,
        type: 'success',
      });
    } catch (err: any) {
      let errMsg = 'Failed to generate PDF document.';
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

  const filteredShortlists = shortlists.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.candidate_name.toLowerCase().includes(q) ||
      s.candidate_code.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.college_name.toLowerCase().includes(q)
    );
  });

  const allFilteredSelected =
    filteredShortlists.length > 0 &&
    filteredShortlists.every((s) => selectedCandidateIds.includes(s.candidate_id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredShortlists.map((s) => s.candidate_id));
    }
  };

  const handleToggleSelectOne = (candId: number) => {
    if (selectedCandidateIds.includes(candId)) {
      setSelectedCandidateIds(selectedCandidateIds.filter((id) => id !== candId));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, candId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="Shortlisted Candidates & Reports"
          subtitle="Manage recruitment pipeline status and generate formatted shortlist documents"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf || selectedCandidateIds.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Building PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Generate PDF ({selectedCandidateIds.length})</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateWordDoc}
                disabled={isGeneratingDoc || selectedCandidateIds.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingDoc ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>DOCX...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>DOCX</span>
                  </>
                )}
              </button>
            </div>
          }
        />

        <main className="p-8 space-y-6 max-w-7xl">
          {/* Filter Bar */}
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Job Role</label>
                <select
                  value={selectedJobRoleId}
                  onChange={(e) => setSelectedJobRoleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="">All Job Roles</option>
                  {jobRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">College</label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="">All Colleges</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Pipeline Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="All">All Stages</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">Search</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Word Document Banner if already generated */}
            {generatedDocUrl && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Word Document Ready</h4>
                    <p className="text-[11px] text-blue-700 font-mono">{docFilename}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadReadyDocx(docFilename)}
                  disabled={isDownloadingDoc}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isDownloadingDoc ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download DOCX</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
              <span>{alertMsg.text}</span>
              <button onClick={() => setAlertMsg(null)} className="font-bold opacity-60">
                ✕
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] subtle-shadow overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Shortlisted Candidates</h3>
                <p className="text-xs text-[#64748B]">Select candidates and export to official Word document</p>
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {selectedCandidateIds.length} of {filteredShortlists.length} Selected
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
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Campus & Dept</th>
                    <th className="p-4 w-20 text-center">CGPA</th>
                    <th className="p-4 w-28 text-center">AI Match Score</th>
                    <th className="p-4">Job Role</th>
                    <th className="p-4 w-40 text-center">Recruitment Status</th>
                    <th className="p-4 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredShortlists.length > 0 ? (
                    filteredShortlists.map((item) => {
                      const isSelected = selectedCandidateIds.includes(item.candidate_id);

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-blue-50/30 transition-colors ${
                            isSelected ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(item.candidate_id)}
                              className="w-4 h-4 text-[#2563EB] rounded focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-[#1E293B] block">{item.candidate_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.candidate_code} • {item.email}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="text-xs text-slate-700 font-medium truncate max-w-[200px]">
                              {item.department}
                            </p>
                            <p className="text-[10px] text-blue-600 truncate max-w-[200px]">
                              {item.college_name}
                            </p>
                          </td>

                          <td className="p-4 text-center font-bold text-slate-800">
                            {item.cgpa.toFixed(2)}
                          </td>

                          <td className="p-4 text-center">
                            <span className="font-black text-[#2563EB] text-sm">
                              {Math.round(item.match_score)}%
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-800 block">{item.role_name}</span>
                            <span className="text-[10px] text-slate-500">{item.company_name}</span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="p-4 text-center">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-colors cursor-pointer ${
                                item.status === 'Shortlisted'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : item.status === 'Assessment'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : item.status === 'Interview'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : item.status === 'Selected'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Assessment">Assessment</option>
                              <option value="Interview">Interview</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteShortlist(item.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                              title="Remove from shortlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                        No shortlisted candidates found for selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
