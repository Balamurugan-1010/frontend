import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Upload,
  Cpu,
  BarChart,
  FileCheck2,
  CheckCircle,
  Users,
  Building,
  GraduationCap,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/15 to-indigo-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin text-[#2563EB]" style={{ animationDuration: '6s' }} />
            <span>AI-Powered Campus Recruitment & Candidate Ranking</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1E293B] max-w-4xl mx-auto leading-[1.15]">
            Show Your Skills. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]">
              Match Your Talent.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            TalentMatch connects college students and campus recruiters with precision AI.
            Submit resumes in seconds or run explainable TF-IDF multi-factor candidate ranking.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/submit-resume"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
            >
              <Upload className="w-5 h-5" />
              <span>Submit Resume (Students)</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/manager/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-[#1E293B] border border-[#E2E8F0] text-base font-semibold shadow-sm hover:shadow transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              <span>Recruiter Manager Login</span>
            </Link>
          </div>

          {/* Live Stat Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] subtle-shadow">
              <span className="text-2xl font-black text-[#2563EB] block">100%</span>
              <span className="text-xs font-medium text-[#64748B]">Automated PDF Text Extraction</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] subtle-shadow">
              <span className="text-2xl font-black text-[#1D4ED8] block">5-Factor</span>
              <span className="text-xs font-medium text-[#64748B]">Weighted AI Match Scoring</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] subtle-shadow">
              <span className="text-2xl font-black text-[#2563EB] block">No Account</span>
              <span className="text-xs font-medium text-[#64748B]">Instant Student Submissions</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] subtle-shadow">
              <span className="text-2xl font-black text-emerald-600 block">DOCX</span>
              <span className="text-xs font-medium text-[#64748B]">Instant Shortlist Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Complete End-To-End Platform
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-[#1E293B] tracking-tight">
              Built for Campus Placement Drives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] card-hover-effect space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">Frictionless Student Entry</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Students submit standardized profiles without passwords. PDF resumes are parsed instantly
                to detect technical skills, academic projects, and certifications.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] card-hover-effect space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">Explainable AI Matching</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Calculates weighted Match Scores combining TF-IDF JD cosine similarity, normalized skill overlap,
                portfolio relevance, and CGPA academic eligibility.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] card-hover-effect space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">Professional Word Reports</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Recruiters select candidates and export publication-ready formatted <code className="text-xs bg-slate-200 px-1 py-0.5 rounded text-blue-700">.docx</code> documents
                containing summary tables, skill gaps, and interview profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Workflow */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Recruitment Workflow
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-[#1E293B] tracking-tight">
              From Campus Drive to Final Offer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select College & Role',
                desc: 'Pick your target campus and job role requirements with minimum CGPA threshold.',
              },
              {
                step: '02',
                title: 'Run AI Screening',
                desc: 'Instantly rank hundreds of student resumes with TF-IDF similarity and skill gap analysis.',
              },
              {
                step: '03',
                title: 'Compare & Shortlist',
                desc: 'Evaluate side-by-side matrices and advance candidates to Assessment and Interview stages.',
              },
              {
                step: '04',
                title: 'Generate Shortlist DOCX',
                desc: 'Download a beautifully styled Word report ready for HR leadership and campus authorities.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-3">
                <span className="text-3xl font-black text-blue-100 block">{item.step}</span>
                <h4 className="text-base font-bold text-[#1E293B]">{item.title}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E2E8F0] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1E293B]">TalentMatch</span>
            <span>•</span>
            <span>AI-Powered Resume Screening & Candidate Ranking System</span>
          </div>
          <p>© 2026 TalentMatch. All rights reserved. Recruiter recommendation tool.</p>
        </div>
      </footer>
    </div>
  );
};
