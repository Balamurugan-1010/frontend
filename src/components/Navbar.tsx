import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-[#1E293B]">
              Talent<span className="text-[#2563EB]">Match</span>
            </span>
            <span className="block text-[11px] font-medium text-[#64748B] tracking-wide -mt-1">
              Show Your Skills. Match Your Talent.
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/submit-resume"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/submit-resume'
                ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                : 'text-[#1E293B] hover:text-[#2563EB] hover:bg-[#F8FAFC]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <span>Submit Resume</span>
          </Link>

          {isAuthenticated ? (
            <Link
              to="/manager/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              <span>Manager Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/manager/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Manager Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
