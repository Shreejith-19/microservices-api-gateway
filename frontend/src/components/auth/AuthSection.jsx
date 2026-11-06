import React, { useState } from 'react';
import { 
  KeyRound, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  LogOut, 
  User as UserIcon, 
  Mail, 
  Clock, 
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequestTelemetry } from '../../context/RequestContext';
import { login as apiLogin, register as apiRegister } from '../../services/gatewayService';
import { InputField } from '../common/InputField';
import { SubmitButton } from '../common/SubmitButton';
import { AlertBanner } from '../common/AlertBanner';

export const AuthSection = () => {
  const { token, user, decodedToken, isAuthenticated, login, logout } = useAuth();
  const { authNotice, clearAuthNotice } = useRequestTelemetry();

  // Active form tab ('login' | 'register')
  const [activeTab, setActiveTab] = useState('login');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  // Registration form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState({});

  // Processing & notification states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // JWT string display toggle & copy
  const [showRawToken, setShowRawToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email format regex validator
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle Login Validation and Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    const errors = {};
    if (!loginEmail.trim()) {
      errors.email = 'Email address is required';
    } else if (!isValidEmail(loginEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginPassword) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }
    setLoginErrors({});

    setIsSubmitting(true);
    try {
      // Backend Contract: POST /api/auth/login { email, password }
      const response = await apiLogin({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (response?.data?.token) {
        // Store JWT and update reactive AuthContext
        login(response.data.token, response.data.user);
        setSuccessMessage(response.message || 'Login successful! JWT stored and active.');
        setLoginPassword(''); // Do not retain password in state
      } else {
        setErrorMessage('Unexpected response: Missing token in authentication payload.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to authenticate with Auth Service.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration Validation and Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    const errors = {};
    if (!regName.trim()) {
      errors.name = 'Full name is required';
    } else if (regName.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!regEmail.trim()) {
      errors.email = 'Email address is required';
    } else if (!isValidEmail(regEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!regPassword) {
      errors.password = 'Password is required';
    } else if (regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }
    setRegErrors({});

    setIsSubmitting(true);
    try {
      // Backend Contract: POST /api/auth/register { name, email, password }
      const response = await apiRegister({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
      });

      setSuccessMessage(response.message || 'User registered successfully! You can now log in.');
      
      // Pre-fill login email and switch to login tab
      setLoginEmail(regEmail.trim().toLowerCase());
      setRegPassword('');
      setRegConfirmPassword('');
      setActiveTab('login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to register new user.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    setSuccessMessage('Logged out successfully. JWT session cleared.');
    setErrorMessage(null);
    clearAuthNotice();
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Identity & Authentication
            </h2>
            <p className="text-xs text-slate-400">
              Auth Service (:5001) credentials & edge JWT issuance
            </p>
          </div>
        </div>

        {/* Auth Status Badge */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> AUTHENTICATED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
              <Lock className="w-3.5 h-3.5" /> GUEST / PUBLIC
            </span>
          )}
        </div>
      </div>

      {/* Global Notifications: 401 Session Notice, Success, Error */}
      <div className="space-y-3 mb-4">
        {authNotice && (
          <AlertBanner
            type="warning"
            title="Session Notice (HTTP 401)"
            message={authNotice.message || 'Authentication session has expired. Please log in again.'}
            onDismiss={clearAuthNotice}
          />
        )}

        {successMessage && (
          <AlertBanner
            type="success"
            title="Success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}

        {errorMessage && (
          <AlertBanner
            type="error"
            title="Authentication Error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
            activeTab === 'login'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" /> Login
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
            activeTab === 'register'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Register
        </button>

        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogoutClick}
            className="ml-auto text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            title="Clear JWT session and log out"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        )}
      </div>

      {/* Form: Login */}
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
          <InputField
            id="login-email"
            label="EMAIL ADDRESS"
            type="email"
            required
            Icon={Mail}
            placeholder="developer@example.com"
            value={loginEmail}
            error={loginErrors.email}
            disabled={isSubmitting}
            autoComplete="email"
            onChange={(e) => {
              setLoginEmail(e.target.value);
              if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: null }));
            }}
          />

          <InputField
            id="login-password"
            label="PASSWORD"
            type="password"
            required
            Icon={Lock}
            placeholder="••••••••••••"
            value={loginPassword}
            error={loginErrors.password}
            disabled={isSubmitting}
            autoComplete="current-password"
            onChange={(e) => {
              setLoginPassword(e.target.value);
              if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: null }));
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Calls Gateway <code className="text-indigo-300">POST /api/auth/login</code>
            </span>

            <SubmitButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Authenticating..."
              Icon={LogIn}
            >
              Sign In
            </SubmitButton>
          </div>
        </form>
      )}

      {/* Form: Register */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
          <InputField
            id="reg-name"
            label="FULL NAME"
            type="text"
            required
            Icon={UserIcon}
            placeholder="e.g. Alex Mercer"
            value={regName}
            error={regErrors.name}
            disabled={isSubmitting}
            autoComplete="name"
            onChange={(e) => {
              setRegName(e.target.value);
              if (regErrors.name) setRegErrors((prev) => ({ ...prev, name: null }));
            }}
          />

          <InputField
            id="reg-email"
            label="EMAIL ADDRESS"
            type="email"
            required
            Icon={Mail}
            placeholder="developer@example.com"
            value={regEmail}
            error={regErrors.email}
            disabled={isSubmitting}
            autoComplete="email"
            onChange={(e) => {
              setRegEmail(e.target.value);
              if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: null }));
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              id="reg-password"
              label="PASSWORD (MIN 6 CHARS)"
              type="password"
              required
              Icon={Lock}
              placeholder="••••••••••••"
              value={regPassword}
              error={regErrors.password}
              disabled={isSubmitting}
              autoComplete="new-password"
              onChange={(e) => {
                setRegPassword(e.target.value);
                if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: null }));
              }}
            />

            <InputField
              id="reg-confirm-password"
              label="CONFIRM PASSWORD"
              type="password"
              required
              Icon={Lock}
              placeholder="••••••••••••"
              value={regConfirmPassword}
              error={regErrors.confirmPassword}
              disabled={isSubmitting}
              autoComplete="new-password"
              onChange={(e) => {
                setRegConfirmPassword(e.target.value);
                if (regErrors.confirmPassword) setRegErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Calls Gateway <code className="text-indigo-300">POST /api/auth/register</code>
            </span>

            <SubmitButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Creating account..."
              Icon={UserPlus}
            >
              Create Account
            </SubmitButton>
          </div>
        </form>
      )}

      {/* Active Session & JWT Inspector Subpanel */}
      {isAuthenticated && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                ACTIVE JWT SESSION
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                HS256 Verified
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRawToken(!showRawToken)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
              >
                {showRawToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showRawToken ? 'Hide Token' : 'Show Token'}
              </button>

              <button
                type="button"
                onClick={handleCopyToken}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy JWT bearer token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Raw Token String Display */}
          {showRawToken && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 break-all mb-3 select-all">
              {token}
            </div>
          )}

          {/* Decoded JWT Claims Grid */}
          {decodedToken && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">SUBJECT (USER ID)</span>
                <span className="text-indigo-300 font-medium truncate block">
                  {decodedToken.userId || user?.id || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">IDENTITY (EMAIL)</span>
                <span className="text-slate-200 truncate block">
                  {decodedToken.email || user?.email || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">SESSION EXPIRATION</span>
                <span className="text-emerald-400 block flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleTimeString() : 'Active'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthSection;
