import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  RotateCw,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export const ManagerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/manager/dashboard';

  // Check for expired session query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      setErrorMsg('Your session has expired or authorization was lost. Please verify your email to log in again.');
    }
  }, [location.search]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Send OTP handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered manager email address.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.sendOtp(email.trim());
      setStep('otp');
      setOtp('');
      setCooldownSeconds(res.cooldown_seconds || 60);
      setSuccessMsg(res.message || `Verification code sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'Unable to send verification code. Please check your email and network connection.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setIsResending(true);
      const res = await authService.sendOtp(email.trim());
      setOtp('');
      setCooldownSeconds(res.cooldown_seconds || 60);
      setSuccessMsg(`New verification code sent to ${email.trim()}. Previous code has been invalidated.`);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'Failed to resend verification code. Please try again later.';
      setErrorMsg(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithOtp(email.trim(), cleanOtp);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'Invalid or expired verification code. Please request a new OTP.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy Password login handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your manager email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'Invalid manager credentials. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Home</span>
          </Link>
        </div>

        {/* Brand header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Manager Secure Portal
          </h2>
          <p className="mt-1.5 text-xs text-[#64748B]">
            TalentMatch • AI Campus Recruitment Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2E8F0] shadow-xl shadow-slate-200/50 space-y-6">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* PRIMARY WORKFLOW: Email OTP Verification */}
          {authMode === 'otp' && (
            <>
              {step === 'email' ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Registered Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="manager@talentmatch.ai"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 leading-normal">
                      A secure 6-digit one-time passcode will be sent to your registered email address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* Recipient pill with edit option */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(val);
                        }}
                        className="w-full py-3 px-4 rounded-xl border border-[#CBD5E1] text-center text-2xl font-mono tracking-[0.5em] font-extrabold text-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all bg-slate-50/50"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-500">
                      <span>Expires in 5 minutes</span>
                      <span>Max 5 attempts</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify OTP</span>
                      </>
                    )}
                  </button>

                  {/* Resend Cooldown Section */}
                  <div className="pt-2 text-center border-t border-slate-100">
                    {cooldownSeconds > 0 ? (
                      <p className="text-xs text-slate-500">
                        Resend code in{' '}
                        <span className="font-semibold text-[#2563EB] font-mono">
                          {cooldownSeconds}s
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        <span>{isResending ? 'Resending Code...' : 'Resend OTP'}</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* SECONDARY / COMPATIBILITY WORKFLOW: Password Login */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Work Email / Manager ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="recruiter@talentmatch.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In with Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between OTP and Password login */}
          <div className="pt-2 text-center border-t border-slate-100">
            {authMode === 'otp' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[11px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
              >
                Sign in with Password instead
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setStep('email');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[11px] font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
              >
                Sign in with Email OTP instead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
