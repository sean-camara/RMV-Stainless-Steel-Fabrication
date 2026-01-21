import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (passedChecks >= 4) strength = 'medium';
  if (passedChecks === 5) strength = 'strong';

  return { checks, strength, passedChecks };
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const passwordStrength = useMemo(() => checkPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!acceptedTerms) {
      setError('You must accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      navigate('/verify-email', { 
        state: { 
          email: formData.email
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-10 hero-fade-up">
        <Link 
          to="/" 
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm group"
        >
          <svg 
            className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="hero-fade-up hero-delay-1">
          <Link to="/" className="flex justify-center mb-6">
            <img src="/1.jpg" alt="RMV Logo" className="h-16 w-16 rounded-full object-cover shadow-lg border-2 border-white" />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-bold text-slate-900 tracking-tight hero-fade-up hero-delay-2">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 hero-fade-up hero-delay-3">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[500px] relative z-10 hero-fade-up hero-delay-3 px-4 sm:px-0">
        <div className="bg-white/80 backdrop-blur-sm py-10 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-2xl">
          {error && (
             <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 hero-fade-up hero-delay-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2 font-light">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm bg-white/50"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2 font-light">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm bg-white/50"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="hero-fade-up" style={{ animationDelay: '0.45s' }}>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 font-light">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm bg-white/50"
                placeholder="Enter email address"
              />
            </div>

            <div className="hero-fade-up" style={{ animationDelay: '0.5s' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2 font-light">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm bg-white/50 pr-10 group-hover:border-slate-300"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.977-5.32M10.5 8.5a3 3 0 11-6.708 7.373" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.882 9.882l-3.264 3.264M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.07 4.93L4.93 19.07" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Strength Bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          passwordStrength.strength === 'weak'
                            ? 'w-1/3 bg-red-500'
                            : passwordStrength.strength === 'medium'
                            ? 'w-2/3 bg-amber-500'
                            : 'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        passwordStrength.strength === 'weak'
                          ? 'text-red-500'
                          : passwordStrength.strength === 'medium'
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>

                  {/* Checklist */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <li className={`flex items-center gap-2 transition-colors duration-300 ${passwordStrength.checks.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${passwordStrength.checks.minLength ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}`}>
                        {passwordStrength.checks.minLength && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      8+ characters
                    </li>
                    <li className={`flex items-center gap-2 transition-colors duration-300 ${passwordStrength.checks.hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${passwordStrength.checks.hasUppercase ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}`}>
                        {passwordStrength.checks.hasUppercase && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      Uppercase
                    </li>
                    <li className={`flex items-center gap-2 transition-colors duration-300 ${passwordStrength.checks.hasLowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${passwordStrength.checks.hasLowercase ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}`}>
                        {passwordStrength.checks.hasLowercase && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      Lowercase
                    </li>
                    <li className={`flex items-center gap-2 transition-colors duration-300 ${passwordStrength.checks.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${passwordStrength.checks.hasNumber ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}`}>
                        {passwordStrength.checks.hasNumber && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      Number
                    </li>
                    <li className={`flex items-center gap-2 transition-colors duration-300 ${passwordStrength.checks.hasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${passwordStrength.checks.hasSpecial ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}`}>
                        {passwordStrength.checks.hasSpecial && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      Special char
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="hero-fade-up" style={{ animationDelay: '0.55s' }}>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2 font-light">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm bg-white/50 pr-10 group-hover:border-slate-300"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.977-5.32M10.5 8.5a3 3 0 11-6.708 7.373" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.882 9.882l-3.264 3.264M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.07 4.93L4.93 19.07" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center hero-fade-up" style={{ animationDelay: '0.6s' }}>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 transition-colors cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 font-light">
                I agree to the{' '}
                <a href="#" className="font-semibold text-slate-900 hover:underline transition-all underline-offset-4 decoration-slate-200">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div className="hero-fade-up" style={{ animationDelay: '0.65s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 relative overflow-hidden group shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800 transition-all duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 text-center hero-fade-up" style={{ animationDelay: '0.7s' }}>
            <p className="text-sm text-slate-500 font-light">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-slate-900 hover:underline transition-all underline-offset-4 decoration-slate-200 hover:decoration-slate-900">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
