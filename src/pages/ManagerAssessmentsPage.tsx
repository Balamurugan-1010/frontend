import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import { assessmentService, jobRoleService } from '../services/api';
import { AssessmentItem, JobRole } from '../types';

export const ManagerAssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aData, rData] = await Promise.all([
          assessmentService.getAll(),
          jobRoleService.getAll(),
        ]);
        setAssessments(aData);
        setJobRoles(rData);
      } catch (err) {
        console.error('Failed to load assessments', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdateAssessment = async (id: number, score: number, status: string) => {
    try {
      await assessmentService.update(id, { score, status });
      setAssessments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, score, status } : a))
      );
    } catch (err) {
      alert('Failed to update assessment');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="Candidate Assessments & Rounds"
          subtitle="Track technical assessments, coding rounds, and interview evaluation scores"
        />

        <main className="p-8 space-y-6 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Total Assessments</span>
              <span className="text-3xl font-black text-[#1E293B] block">{assessments.length}</span>
              <p className="text-[11px] text-slate-500">Scheduled evaluation rounds</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Completed</span>
              <span className="text-3xl font-black text-emerald-600 block">
                {assessments.filter((a) => a.status === 'Completed').length}
              </span>
              <p className="text-[11px] text-slate-500">Graded coding assessments</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Pending Evaluation</span>
              <span className="text-3xl font-black text-amber-600 block">
                {assessments.filter((a) => a.status === 'Scheduled').length}
              </span>
              <p className="text-[11px] text-slate-500">Awaiting student completion</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8F0] subtle-shadow overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">Assessment Track Records</h3>
                <p className="text-xs text-[#64748B]">Manage scores for shortlisted campus candidates</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Job Role</th>
                    <th className="p-4">Round / Type</th>
                    <th className="p-4 w-28 text-center">Score (/100)</th>
                    <th className="p-4 w-36 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.length > 0 ? (
                    assessments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-[#1E293B] block">{a.candidate_name}</span>
                          <span className="text-[10px] text-slate-400">{a.candidate_code} • {a.department}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{a.role_name}</td>
                        <td className="p-4 text-slate-600">{a.assessment_type}</td>
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={a.score}
                            onChange={(e) =>
                              handleUpdateAssessment(a.id, parseFloat(e.target.value) || 0, a.status)
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold text-blue-600 focus:outline-none focus:border-blue-600"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={a.status}
                            onChange={(e) => handleUpdateAssessment(a.id, a.score, e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Passed">Passed</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No candidate assessments currently scheduled.
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
