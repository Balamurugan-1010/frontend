import React from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ManagerHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ManagerHeader: React.FC<ManagerHeaderProps> = ({ title, subtitle, actions }) => {
  const { manager } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {actions && <div className="flex items-center gap-3">{actions}</div>}

        <div className="h-8 w-[1px] bg-[#E2E8F0]" />

        {/* Live campus status badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Drive Active</span>
        </div>

        {/* Notifications button */}
        <button
          className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-[#2563EB] absolute top-2 right-2 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
