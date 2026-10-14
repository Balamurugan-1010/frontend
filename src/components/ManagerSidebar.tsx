import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
  ClipboardList,
  BarChart3,
  Sliders,
  LogOut,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ManagerSidebar: React.FC = () => {
  const { manager, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/manager/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Colleges', path: '/manager/colleges', icon: GraduationCap },
    { name: 'Job Roles', path: '/manager/job-roles', icon: Briefcase },
    { name: 'Candidates & AI Match', path: '/manager/candidates', icon: Users },
    { name: 'Shortlisted', path: '/manager/shortlisted', icon: CheckCircle2 },
    { name: 'Assessments', path: '/manager/assessments', icon: ClipboardList },
    { name: 'Reports', path: '/manager/reports', icon: BarChart3 },
    { name: 'Settings', path: '/manager/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Brand header */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#1E293B]">
              Talent<span className="text-[#2563EB]">Match</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold text-[#64748B] tracking-wider">
              Recruiter SaaS
            </span>
          </div>
        </div>

        {/* Company indicator */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#1E293B] truncate">{manager?.company_name || 'Partner Company'}</p>
            <p className="text-[10px] text-[#64748B] truncate">Campus Drive 2026</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-500/25 font-semibold'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Recruiter profile & logout */}
      <div className="p-4 border-t border-[#E2E8F0] space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] font-bold text-sm flex items-center justify-center border border-blue-200">
            {manager?.name ? manager.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-[#1E293B] truncate">{manager?.name || 'Recruiter'}</p>
            <p className="text-xs text-[#64748B] truncate">{manager?.email || 'manager@talentmatch.ai'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
