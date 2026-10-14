import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CheckCircle,
  Building,
  MapPin,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import { collegeService } from '../services/api';
import { College } from '../types';

export const ManagerCollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await collegeService.getAll();
        setColleges(data);
      } catch (err) {
        console.error('Failed to load colleges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const handleLaunchMatchingForCollege = (collegeId: number) => {
    navigate(`/manager/candidates?college_id=${collegeId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="Campus College Directory"
          subtitle="Manage partner institutes, view eligibility quotas, and filter candidate pools"
        />

        <main className="p-8 space-y-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">Partner Institutions ({colleges.length})</h2>
              <p className="text-xs text-[#64748B]">Click any campus to filter candidates and run matching drives</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-2" />
              <p className="text-xs text-[#64748B]">Loading college metrics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((col) => (
                <div
                  key={col.id}
                  className="bg-white rounded-3xl border border-[#E2E8F0] p-6 subtle-shadow hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        ID: #{col.id}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#1E293B] leading-snug">{col.name}</h3>
                      <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{col.location}</span>
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <span className="text-xs text-[#64748B] block">Total</span>
                        <span className="text-sm font-bold text-[#1E293B]">{col.total_candidates}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#64748B] block">Eligible</span>
                        <span className="text-sm font-bold text-emerald-600">{col.eligible_candidates}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#64748B] block">Avg CGPA</span>
                        <span className="text-sm font-bold text-[#2563EB]">{col.average_cgpa.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Departments */}
                    {col.departments && col.departments.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-[#64748B] block">
                          Participating Departments:
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {col.departments.map((dept, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filter / Match Action */}
                  <button
                    onClick={() => handleLaunchMatchingForCollege(col.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 group border border-blue-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Filter & Match Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
