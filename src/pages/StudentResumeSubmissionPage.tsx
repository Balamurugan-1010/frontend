import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { candidateService } from '../services/api';

export const StudentResumeSubmissionPage: React.FC = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Success modal state
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [assignedCode, setAssignedCode] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): string | null => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      return 'Invalid file type. Only PDF resumes are accepted.';
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      return 'File exceeds maximum limit of 5 MB.';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const error = validateFile(selected);
      if (error) {
        setErrorMsg(error);
        setFile(null);
      } else {
        setErrorMsg('');
        setFile(selected);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      const error = validateFile(selected);
      if (error) {
        setErrorMsg(error);
        setFile(null);
      } else {
        setErrorMsg('');
        setFile(selected);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please complete all mandatory personal details.');
      return;
    }

    if (!file) {
      setErrorMsg('Please upload your resume in PDF format (maximum 5 MB).');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(15);

      // 1. Submit candidate metadata
      const cand = await candidateService.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      setUploadProgress(40);

      // 2. Upload resume PDF
      const resumeRes = await candidateService.uploadResume(cand.id, file, (pct) => {
        setUploadProgress(40 + Math.round(pct * 0.55));
      });

      setUploadProgress(100);
      setAssignedCode(cand.candidate_code);
      setExtractedSkills(resumeRes.skills || []);
      setSubmissionSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to submit resume. Please check your network and try again.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Public Student Portal • No Account Required</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Submit Your Resume
          </h1>
          <p className="mt-2 text-sm text-[#64748B] max-w-xl mx-auto">
            Get your profile screened and matched for top campus placement drives with our AI ranking system.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-10 space-y-8">
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-[#2563EB]" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aravind Swaminathan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aravind.s@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Resume PDF Upload */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              Resume Upload (PDF Only • Max 5 MB)
            </h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-[#CBD5E1] hover:border-[#2563EB] hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">{file.name}</p>
                    <p className="text-xs text-[#64748B]">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-rose-500 hover:underline mt-1 font-semibold"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">
                      Drag and drop your PDF resume here, or <span className="text-[#2563EB]">browse</span>
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">Accepts standard PDF files up to 5 MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {isSubmitting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#64748B]">
                  <span>Processing & Parsing Resume with PyMuPDF...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-[#2563EB] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-base shadow-md shadow-blue-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Parsing and Submitting Resume...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Submit Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#1E293B]">Resume Submitted Successfully</h3>
              <p className="text-xs text-[#64748B] mt-1.5">
                Your profile has been processed, technical skills extracted, and registered for campus recruitment.
              </p>
            </div>

            {/* Generated Candidate Code Box */}
            <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] space-y-1">
              <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
                Your Unique Candidate ID
              </span>
              <span className="text-2xl font-black text-[#1D4ED8] tracking-widest block font-mono">
                {assignedCode}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Save this candidate ID for recruitment reference.
              </span>
            </div>

            {/* Extracted skills pill list */}
            {extractedSkills.length > 0 && (
              <div className="text-left space-y-2">
                <span className="text-xs font-semibold text-[#1E293B] block">
                  Detected Skills ({extractedSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {extractedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] transition-all"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
