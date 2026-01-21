import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative flex flex-col justify-center items-center px-4 overflow-hidden bg-slate-50 font-sans">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-200/50 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-300/30 blur-[120px]" />
        </div>

        <div className="w-full max-w-md relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 hero-fade-up">
            <Link to="/" className="flex flex-col items-center space-y-4 group">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-[10deg] shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-transparent opacity-50" />
                <span className="text-white font-black text-2xl relative z-10">R</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">RMV INDUSTRIAL</span>
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl py-12 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl border border-white/50 relative overflow-hidden hero-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 hero-fade-up" style={{ animationDelay: '0.2s' }}>
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 hero-fade-up text-center uppercase tracking-tight" style={{ animationDelay: '0.3s' }}>Check your email</h2>
            <p className="text-slate-500 mb-8 font-light hero-fade-up text-center" style={{ animationDelay: '0.4s' }}>
              We've sent a password reset code to<br/>
              <span className="font-semibold text-slate-900 break-all">{email}</span>
            </p>
            
            <div className="space-y-4 hero-fade-up" style={{ animationDelay: '0.5s' }}>
              <Link
                to="/reset-password"
                state={{ email }}
                className="w-full inline-flex justify-center py-4 px-6 rounded-xl shadow-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all hover:-translate-y-0.5 tracking-widest uppercase"
              >
                Enter Reset Code
              </Link>
              <div className="pt-2 text-center">
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest inline-flex items-center gap-2 group">
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 overflow-hidden bg-slate-50 font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-200/50 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-300/30 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 hero-fade-up">
          <Link to="/" className="flex flex-col items-center space-y-4 group">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-[10deg] shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-transparent opacity-50" />
              <span className="text-white font-black text-2xl relative z-10">R</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">RMV Industrial</span>
          </Link>
          <h2 className="mt-8 text-center text-3xl font-black text-slate-900 tracking-tight uppercase">
            Forgot password?
          </h2>
          <p className="mt-3 text-center text-slate-500 font-light max-w-[280px] mx-auto leading-relaxed">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl py-12 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl border border-white/50 relative overflow-hidden hero-fade-up" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="hero-fade-up" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 font-light">
                Email Address
              </label>
              <div className="group transition-all">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm bg-white/50 group-hover:border-slate-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="hero-fade-up" style={{ animationDelay: '0.3s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 relative overflow-hidden group shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 rounded-xl disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800 transition-all duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Send Reset Code
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center hero-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest inline-flex items-center gap-2 group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
