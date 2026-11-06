import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  Sparkles, 
  AlertCircle, 
  Shield, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  Lock,
  Mail,
  Image,
  FileText,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, updateProfile } from '../../services/gatewayService';
import { InputField } from '../common/InputField';
import { SubmitButton } from '../common/SubmitButton';
import { AlertBanner } from '../common/AlertBanner';

export const ProfileSection = () => {
  const { isAuthenticated, user, decodedToken } = useAuth();

  // Component states: 'idle' | 'loading' | 'loaded' | 'empty' | 'unauthenticated'
  const [profileState, setProfileState] = useState('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Profile data from User Service (:5002)
  const [profile, setProfile] = useState(null);

  // Form input states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formProfilePicture, setFormProfilePicture] = useState('');

  // Expected user ID from verified JWT
  const expectedUserId = decodedToken?.userId || user?.id || '';

  // 1. Fetch profile via Gateway endpoint GET /api/users/profile
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfileState('unauthenticated');
      return;
    }

    setProfileState('loading');
    setErrorMessage(null);

    try {
      // Backend Contract: GET /api/users/profile (No userId constructed in URL)
      const res = await fetchProfile();
      if (res?.data) {
        setProfile(res.data);
        setFormName(res.data.name || '');
        setFormEmail(res.data.email || user?.email || '');
        setFormBio(res.data.bio || '');
        setFormProfilePicture(res.data.profilePicture || '');
        setProfileState('loaded');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // 404: User exists in auth_db, but has not yet created a record in user_db
        setProfileState('empty');
      } else if (err.response?.status === 401) {
        setProfileState('unauthenticated');
        setErrorMessage('Authentication token expired or rejected by API Gateway.');
      } else {
        setProfileState('empty');
        setErrorMessage(err.response?.data?.message || err.message || 'Failed to fetch user profile.');
      }
    }
  }, [isAuthenticated, user?.email]);

  // Synchronize state with reactive authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setProfileState('unauthenticated');
      setProfile(null);
      setFormName('');
      setFormEmail('');
      setFormBio('');
      setFormProfilePicture('');
      setIsEditing(false);
      setStatusMessage(null);
      setErrorMessage(null);
    }
  }, [isAuthenticated, loadProfile]);

  // 2. Update profile via Gateway endpoint PUT /api/users/profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Action blocked: Authentication required to update profile.');
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      // Backend Contract: PUT /api/users/profile (No userId constructed in URL)
      const payload = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        bio: formBio.trim(),
        profilePicture: formProfilePicture.trim(),
      };

      const res = await updateProfile(payload);

      if (res?.data) {
        setStatusMessage(res.message || 'Profile updated successfully in user_db!');
        setIsEditing(false);
        // Requirement 9: Refresh the profile after successful updates
        await loadProfile();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update user profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if backend confirmed identity matches authenticated JWT
  const isIdentityConfirmed = Boolean(
    isAuthenticated && 
    profile?.userId && 
    expectedUserId && 
    profile.userId === expectedUserId
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              User Profile (Isolated user_db)
            </h2>
            <p className="text-xs text-slate-400">
              User Service (:5002) resolved via Gateway header injection
            </p>
          </div>
        </div>

        {/* Live Refresh Button */}
        <button
          type="button"
          onClick={loadProfile}
          disabled={!isAuthenticated || profileState === 'loading'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={isAuthenticated ? 'Query User Service through API Gateway' : 'Requires authentication'}
        >
          <RefreshCw className={`w-3 h-3 ${profileState === 'loading' ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh GET</span>
        </button>
      </div>

      {/* Notifications */}
      <div className="space-y-3 mb-4">
        {statusMessage && (
          <AlertBanner
            type="success"
            title="Update Complete"
            message={statusMessage}
            onDismiss={() => setStatusMessage(null)}
          />
        )}

        {errorMessage && (
          <AlertBanner
            type="error"
            title="Profile Error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}
      </div>

      {/* Identity Inspection Section */}
      <div className="mb-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            IDENTITY VERIFICATION & FORWARDING INSPECTION
          </span>

          {/* Confirmation Status Badge */}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${
            isIdentityConfirmed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isAuthenticated
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isIdentityConfirmed ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> CONFIRMED BY USER SERVICE
              </>
            ) : isAuthenticated ? (
              <>
                <Sparkles className="w-3 h-3" /> AWAITING INITIAL PROFILE RECORD
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> GUEST (NO IDENTITY)
              </>
            )}
          </span>
        </div>

        {/* Identity Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">AUTHENTICATED JWT SUBJECT</span>
            <span className="text-indigo-300 font-semibold truncate block">
              {expectedUserId || 'None (Unauthenticated)'}
            </span>
          </div>

          <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">BACKEND CONFIRMED IDENTITY (user_db)</span>
            <span className="text-emerald-400 font-semibold truncate block">
              {profile?.userId || (isAuthenticated ? 'Not initialized in user_db' : 'None')}
            </span>
          </div>
        </div>

        {/* Architecture Flow Explanation */}
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-0.5">
          The client sends <code className="text-indigo-300 font-mono">GET /api/users/profile</code> with only the Bearer JWT. The Gateway validates the token, strips any client-supplied <code className="text-slate-300 font-mono">x-user-id</code> headers, and injects the verified identity into the proxy request to User Service. The frontend confirms this boundary via the matching <code className="text-emerald-400 font-mono">userId</code> returned by the backend.
        </p>
      </div>

      {/* State 0: Unauthenticated Guard */}
      {!isAuthenticated && (
        <div className="p-6 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-semibold text-slate-300 mb-1">
            JWT Authentication Required
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-2">
            Log in via the Authentication panel to generate a signed token and query User Service on port 5002.
          </p>
          <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
            Protected Gateway Route: /api/users/*
          </span>
        </div>
      )}

      {/* State 1: Skeleton Loading */}
      {isAuthenticated && profileState === 'loading' && (
        <div className="animate-pulse space-y-4 p-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="w-32 h-4 rounded bg-slate-800" />
              <div className="w-48 h-3 rounded bg-slate-800/60" />
            </div>
          </div>
          <div className="w-full h-12 rounded bg-slate-800/40" />
        </div>
      )}

      {/* State 2: 404 Initial Empty Profile State */}
      {isAuthenticated && profileState === 'empty' && (
        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            404 UserProfile Not Initialized in user_db
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Auth Service (<code className="text-slate-300 font-mono">auth_db</code>) and User Service (<code className="text-slate-300 font-mono">user_db</code>) maintain isolated databases. A new user must perform a <code className="text-amber-300 font-mono">PUT /api/users/profile</code> upsert to initialize their profile record.
          </p>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setFormName(user?.name || 'Cloud Architect');
              setFormEmail(user?.email || 'engineer@microservices.local');
              setFormBio('Distributed systems and microservices engineer.');
              setFormProfilePicture('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
              handleSaveProfile();
            }}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Initialize Profile Record (PUT /api/users/profile)
          </button>
        </div>
      )}

      {/* State 3: Loaded Profile Card (Display or Edit Form) */}
      {isAuthenticated && profileState === 'loaded' && profile && (
        <div className="space-y-4">
          
          {/* Top Bar: Avatar, Names, and Toggle */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={profile.profilePicture || formProfilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={profile.name || 'User Avatar'}
                className="w-13 h-13 rounded-full object-cover border-2 border-slate-700 shadow-sm bg-slate-800"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {profile.name || user?.name || 'Anonymous User'}
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {profile.email || user?.email || 'No email set'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isEditing) {
                  // Synchronize form inputs with current profile
                  setFormName(profile.name || '');
                  setFormEmail(profile.email || user?.email || '');
                  setFormBio(profile.bio || '');
                  setFormProfilePicture(profile.profilePicture || '');
                }
                setIsEditing(!isEditing);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* View Mode: Bio and Details */}
          {!isEditing && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  BIO / ABOUT
                </span>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {profile.bio || '<No bio configured yet>'}
                </p>
              </div>

              {profile.profilePicture && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 truncate">
                  <span className="text-[10px] text-slate-500 uppercase block mb-0.5">AVATAR URL</span>
                  <span className="text-slate-300">{profile.profilePicture}</span>
                </div>
              )}
            </div>
          )}

          {/* Edit Mode: Full Editable Profile Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="profile-name"
                  label="DISPLAY NAME"
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={formName}
                  disabled={isSaving}
                  onChange={(e) => setFormName(e.target.value)}
                />

                <InputField
                  id="profile-email"
                  label="EMAIL (STORED IN USER_DB)"
                  type="email"
                  placeholder="developer@example.com"
                  value={formEmail}
                  disabled={isSaving}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <InputField
                  id="profile-picture"
                  label="PROFILE PICTURE URL"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formProfilePicture}
                  disabled={isSaving}
                  onChange={(e) => setFormProfilePicture(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="profile-bio" className="block text-xs font-mono font-medium text-slate-300">
                    BIO (MAX 500 CHARACTERS)
                  </label>
                  <span className={`text-[10px] font-mono ${formBio.length > 500 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                    {formBio.length}/500
                  </span>
                </div>
                <textarea
                  id="profile-bio"
                  rows={3}
                  maxLength={500}
                  value={formBio}
                  disabled={isSaving}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Write a brief bio about your engineering role..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-mono">
                  Target: <code className="text-cyan-300">PUT /api/users/profile</code>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>

                  <SubmitButton
                    type="submit"
                    variant="cyan"
                    isLoading={isSaving}
                    loadingText="Saving Profile..."
                    Icon={Save}
                  >
                    Save Profile
                  </SubmitButton>
                </div>
              </div>
            </form>
          )}

          {/* Database & Timestamps Footer */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Database: user_db.userprofiles</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleTimeString() : 'Recently'}
            </span>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileSection;
