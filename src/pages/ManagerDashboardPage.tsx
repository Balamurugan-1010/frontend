import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp,
  Building,
  Calendar,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import { statsService } from '../services/api';
import { DashboardStats, Candidate } from '../types';
import { CandidateDetailModal } from '../components/CandidateDetailModal';

export const ManagerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="Dashboard Overview"
          subtitle="TalentMatch AI • Campus Placement Management"
          actions={
            <Link
              to="/manager/candidates"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run AI Screening</span>
            </Link>
          }
        />

        <main className="p-8 space-y-8 max-w-7xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-2" />
              <p className="text-xs text-[#64748B]">Loading campus metrics...</p>
            </div>
          ) : (
            <>
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Candidates */}
                <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Total Candidates
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1E293B]">
                      {stats?.total_candidates ?? 0}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> Live
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">Verified student resume submissions</p>
                </div>

                {/* Colleges */}
                <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Colleges
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1E293B]">
                      {stats?.total_colleges ?? 0}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">Partner Institutes</span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">Active campus recruitment nodes</p>
                </div>

                {/* Active Job Roles */}
                <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Active Job Roles
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1E293B]">
                      {stats?.active_job_roles ?? 0}
                    </span>
                    <span className="text-xs text-sky-600 font-medium">Open Drives</span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">Configured role criteria & JDs</p>
                </div>

                {/* Shortlisted Candidates */}
                <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Shortlisted
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700">
                      {stats?.shortlisted_candidates ?? 0}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">Accepted</span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">Ready for interviews & DOCX export</p>
                </div>
              </div>

              {/* Fast Action Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-blue-500/15">
                <div className="space-y-1 max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Quick AI Screening
                  </span>
                  <h3 className="text-xl font-bold">Launch AI Candidate Ranking Engine</h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Select a college and job role to rank resumes using TF-IDF cosine similarity,
                    skill matching, and explainable AI insights.
                  </p>
                </div>
                <Link
                  to="/manager/candidates"
                  className="px-6 py-3.5 rounded-2xl bg-white text-[#2563EB] font-bold text-xs hover:bg-blue-50 transition-colors shadow-md shrink-0 flex items-center gap-2"
                >
                  <span>Go to AI Screening</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Grid: Recent Submissions & College Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Submissions */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E2E8F0] p-6 subtle-shadow space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#1E293B]">Recent Student Submissions</h3>
                      <p className="text-xs text-[#64748B]">Latest verified resume uploads</p>
                    </div>
                    <Link
                      to="/manager/candidates"
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {stats?.recent_submissions && stats.recent_submissions.length > 0 ? (
                      stats.recent_submissions.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] font-bold text-sm flex items-center justify-center">
                              {cand.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1E293B]">{cand.name}</p>
                              <p className="text-[11px] text-[#64748B]">
                                {cand.department} • <span className="text-blue-600">{cand.college_name}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-[#1E293B] block">
                              CGPA: {cand.cgpa.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {cand.candidate_code}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-6 text-center text-xs text-slate-400">No candidates registered yet.</p>
                    )}
                  </div>
                </div>

                {/* College Distribution */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 subtle-shadow space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1E293B]">Colleges Representation</h3>
                    <p className="text-xs text-[#64748B]">Candidate pool by campus</p>
                  </div>

                  <div className="space-y-3">
                    {stats?.top_colleges && stats.top_colleges.length > 0 ? (
                      stats.top_colleges.map((col) => (
                        <div key={col.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#1E293B] truncate pr-2">{col.name}</span>
                            <span className="font-bold text-[#2563EB] shrink-0">{col.candidates_count}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (col.candidates_count / Math.max(1, stats.total_candidates)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No colleges data.</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/manager/colleges"
                      className="w-full block py-2.5 rounded-xl text-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-[#1E293B] transition-colors"
                    >
                      Manage All Colleges
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Candidate detail drawer */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};
