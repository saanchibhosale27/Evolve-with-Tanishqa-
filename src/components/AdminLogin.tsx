import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, isEmailAuthorizedAdmin } from '../auth';

interface AdminLoginProps {
  onSuccess: (email: string, token: string) => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToWebsite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessDeniedEmail, setAccessDeniedEmail] = useState<string | null>(null);

  // Email & Password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAccessDeniedEmail(null);

    const cleanEmail = email.trim().toLowerCase();

    // Verify authorized admin email
    if (!isEmailAuthorizedAdmin(cleanEmail)) {
      setIsLoading(false);
      setAccessDeniedEmail(cleanEmail);
      setErrorMessage(
        `Access denied. The account (${cleanEmail}) is not authorized to access the organization dashboard. Only designated administrators may sign in.`
      );
      return;
    }

    try {
      // 1. Try server-side admin login endpoint
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        onSuccess(cleanEmail, data.token);
        return;
      }

      // 2. If password check failed on server, try Firebase email/password login
      try {
        const user = await loginWithEmail(cleanEmail, password);
        const idToken = await user.getIdToken();

        const sRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const sData = await sRes.json();

        if (sRes.ok && sData.success && sData.token) {
          onSuccess(cleanEmail, sData.token);
          return;
        }
      } catch (fbErr: any) {
        // Fall back to server error message
      }

      setErrorMessage(data.error || 'Incorrect administrator password. Please try again.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred while signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setAccessDeniedEmail(null);

    try {
      const user = await loginWithGoogle();
      const signedInEmail = user.email ? user.email.toLowerCase() : '';

      if (!isEmailAuthorizedAdmin(signedInEmail)) {
        setIsLoading(false);
        setAccessDeniedEmail(signedInEmail);
        setErrorMessage(
          `Access denied. The account (${signedInEmail || 'unknown'}) is not an authorized administrator. Only tanishqabhosale99@gmail.com and saanchibhosale27@gmail.com are granted access.`
        );
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.token) {
        onSuccess(signedInEmail, data.token);
      } else {
        setErrorMessage(data.error || 'Server authorization check failed.');
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] text-[#29232B] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#C9B6E4]/40">
      <div className="w-full max-w-md">
        {/* Back link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B5E70] hover:text-[#5B3A6D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to website</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl border border-[#EFE4DE] relative overflow-hidden">
          {/* Brand header */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F3FC] text-[#5B3A6D] text-[11px] font-semibold tracking-wider uppercase mb-3 border border-[#EADFF7]">
              <Lock className="w-3 h-3" />
              Private Organization
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#29232B] font-medium tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E70] mt-1.5">
              Sign in to manage coaching appointments and client bookings.
            </p>
          </div>

          {/* Access Denied Warning */}
          {accessDeniedEmail && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FFF1F0] border border-[#FCDAD7] text-xs text-[#9B2C2C] flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#E86A67] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#822727]">Access Denied</p>
                <p className="mt-0.5 leading-relaxed">
                  The account <strong className="font-mono">{accessDeniedEmail}</strong> is not on the authorized administrator list. Only designated organization accounts may enter.
                </p>
              </div>
            </div>
          )}

          {/* Standard error */}
          {errorMessage && !accessDeniedEmail && (
            <div className="mb-6 p-3.5 rounded-2xl bg-[#FFF1F0] border border-[#FCDAD7] text-xs text-[#9B2C2C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E86A67] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1.5"
              >
                Admin Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanishqabhosale99@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-[#FFFDFB] text-sm text-[#29232B] placeholder:text-[#6B5E70]/40 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-[#FFFDFB] text-sm text-[#29232B] placeholder:text-[#6B5E70]/40 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E86A67]" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in to Bookings</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EFE4DE]" />
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-[#6B5E70]">
              Or continue with
            </span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-full border border-[#EFE4DE] bg-[#FFFDFB] hover:bg-[#F7F3FC] text-xs font-medium text-[#29232B] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Security note */}
          <div className="mt-7 pt-5 border-t border-[#EFE4DE] text-center">
            <p className="text-[11px] text-[#6B5E70] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B3A6D]" />
              <span>Database Row Level Security & Server-Side Enforcement</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
