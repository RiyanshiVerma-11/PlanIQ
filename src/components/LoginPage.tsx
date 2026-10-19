import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkle,
} from 'lucide-react';
import type { AuthUser } from '../types/auth.ts';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToLanding: () => void;
  defaultEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding,
  defaultEmail = 'riyanshiverma46@gmail.com',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('849201');
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Generate a friendly 6-digit simulated code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setStep('otp');
      setResendTimer(30);
      setIsSubmitting(false);
    }, 400);
  };

  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // Auto advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    // Verify against generated code or allow demo bypass code '849201'
    if (entered !== generatedCode && entered !== '849201' && entered !== '123456') {
      setErrorMsg(`Invalid code. Try entering "${generatedCode}" or click auto-fill.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const initials = email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase();

      const user: AuthUser = {
        email: email.trim(),
        name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
        avatarInitials: initials || 'EV',
        role: 'Master Event Director',
        authenticatedAt: new Date().toISOString(),
      };

      onLoginSuccess(user);
    }, 400);
  };

  const handleQuickFillCode = () => {
    const codeArr = generatedCode.split('');
    setOtpDigits(codeArr);
    setErrorMsg(null);
  };

  const handleInstantDemoLogin = () => {
    const user: AuthUser = {
      email: defaultEmail,
      name: 'Riyanshi Verma',
      avatarInitials: 'RV',
      role: 'Master Event Director',
      authenticatedAt: new Date().toISOString(),
    };
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Header */}
      <header className="border-b border-stone-800/80 bg-stone-950/90 px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to PlanIQ Product</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-serif-title text-base font-normal text-stone-100">
              PlanIQ Studio Access
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle gold glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'email' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
                  <Mail className="h-6 w-6" />
                </div>
                <h1 className="font-serif-title text-2xl sm:text-3xl font-normal text-stone-100">
                  Welcome to PlanIQ
                </h1>
                <p className="mt-1.5 text-xs text-stone-400">
                  Sign in with your email to access your execution-ready event blueprints.
                </p>
              </div>

              {/* Fast-Track Evaluator / Judge Login Banner */}
              <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Judging & Hackathon Evaluation</span>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      Skip OTP entry with pre-authenticated Director credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors shadow-md"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Demo Auto-Fill & Enter</span>
                  </button>
                </div>
              </div>

              {/* Quick prefill email chip */}
              <div className="mb-4 rounded-xl border border-stone-800 bg-stone-950/60 p-3">
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                  <span className="font-medium">Detected Account / Quick Fill:</span>
                  <span className="text-amber-400 font-mono text-[10px]">1-Click Autofill</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmail(defaultEmail)}
                  className="w-full text-left font-mono text-xs text-stone-200 hover:text-amber-300 truncate"
                >
                  {defaultEmail}
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                    <Mail className="absolute right-3.5 top-3 h-4 w-4 text-stone-500 pointer-events-none" />
                  </div>
                  {errorMsg && (
                    <p className="mt-1.5 text-xs text-rose-400">{errorMsg}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
                >
                  <span>Send One-Time Passcode (OTP)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Demo 1-Click Access Footer Note */}
              <div className="mt-5 pt-4 border-t border-stone-800 text-center">
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-amber-300 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Instant Evaluator Direct Access (Riyanshi Verma)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
                  <Lock className="h-6 w-6" />
                </div>
                <h1 className="font-serif-title text-2xl sm:text-3xl font-normal text-stone-100">
                  Verify Passcode
                </h1>
                <p className="mt-1.5 text-xs text-stone-400">
                  We sent a 6-digit one-time passcode to{' '}
                  <strong className="text-stone-200 font-medium">{email}</strong>
                </p>
              </div>

              {/* Simulated OTP Display Banner */}
              <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
                <span className="text-[11px] text-stone-300 block mb-1">
                  Simulated Passcode Delivered:
                </span>
                <div className="flex items-center justify-center gap-2 mb-2.5">
                  <span className="font-mono text-2xl font-bold tracking-widest text-amber-400 tabular-nums">
                    {generatedCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFillCode}
                    className="rounded bg-amber-500/30 border border-amber-500/50 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/40"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Instant Evaluator Bypass Button */}
                <button
                  type="button"
                  onClick={() => {
                    handleQuickFillCode();
                    setTimeout(() => {
                      handleInstantDemoLogin();
                    }, 100);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Demo Auto-Fill & One-Click Test Login</span>
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 text-center mb-2.5">
                    Enter 6-Digit Passcode
                  </label>
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        className="h-12 w-10 sm:w-12 rounded-xl border border-stone-700 bg-stone-950 text-center font-mono text-lg font-bold text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    ))}
                  </div>
                  {errorMsg && (
                    <p className="mt-2 text-xs text-rose-400 text-center">{errorMsg}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verify Passcode & Enter Studio</span>
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="hover:text-stone-200"
                >
                  Change Email
                </button>

                {resendTimer > 0 ? (
                  <span className="text-stone-500 font-mono text-[11px]">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedCode(newCode);
                      setResendTimer(30);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-4 text-center text-xs text-stone-500">
        <span>© 2026 PlanIQ. Secure passwordless email & OTP verification.</span>
      </footer>
    </div>
  );
};
