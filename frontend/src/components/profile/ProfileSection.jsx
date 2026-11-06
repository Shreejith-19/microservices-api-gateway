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
  Lock
} from 'lucide-react';
import { fetchProfile, updateProfile } from '../../services/gatewayService';

export const ProfileSection = () => {
  const [profileState, setProfileState] = useState('idle'); // 'idle' | 'loading' | 'loaded' | 'empty' | 'unauthenticated'
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileState('unauthenticated');
      return;
    }

    setProfileState('loading');
    setErrorMessage(null);

    try {
      const res = await fetchProfile();
      if (res?.data) {
        setProfile(res.data);
        setName(res.data.name || '');
        setBio(res.data.bio || '');
        setProfilePicture(res.data.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
        setProfileState('loaded');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileState('empty');
      } else if (err.response?.status === 401) {
        setProfileState('unauthenticated');
        setErrorMessage('Authentication token expired or missing. Please login again.');
      } else {
        setProfileState('empty');
        setErrorMessage(err.response?.data?.message || err.message || 'Failed to fetch user profile.');
      }
    }
  }, []);

  // Check auth and attempt load on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadProfile();
    } else {
      setProfileState('unauthenticated');
    }
  }, [loadProfile]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await updateProfile({
        name: name || 'Demo Engineer',
        bio: bio || 'Cloud infrastructure specialist & microservices architect.',
        profilePicture: profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });

      if (res?.data) {
        setProfile(res.data);
        setName(res.data.name || '');
        setBio(res.data.bio || '');
        setProfilePicture(res.data.profilePicture || '');
        setProfileState('loaded');
        setIsEditing(false);
        setStatusMessage('Profile upserted successfully in user_db via PUT /api/users/profile!');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Section Header */}
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
          disabled={profileState === 'loading'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono transition-colors"
          title="Query User Service through API Gateway"
        >
          <RefreshCw className={`w-3 h-3 ${profileState === 'loading' ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh GET</span>
        </button>
      </div>

      {/* Gateway Identity Forwarding Callout */}
      <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Gateway forwards verified identity header:</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 text-[11px]">
            x-user-id: {profile?.userId ? `${profile.userId.slice(0, 12)}...` : 'Requires JWT auth'}
          </span>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* State 0: Unauthenticated */}
      {profileState === 'unauthenticated' && (
        <div className="p-5 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-semibold text-slate-300 mb-1">
            JWT Authentication Required
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log in above via the Identity & Authentication module to acquire a signed token and query User Service.
          </p>
        </div>
      )}

      {/* State 1: Skeleton Loading */}
      {profileState === 'loading' && (
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
      {profileState === 'empty' && (
        <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            404 UserProfile Not Initialized in user_db
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Auth Service and User Service use isolated MongoDB databases. A new user must perform a <code className="text-amber-300 font-mono">PUT /api/users/profile</code> upsert to initialize their profile record.
          </p>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setName('Cloud Engineer');
              setBio('Microservices platform engineer.');
              setProfilePicture('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
              handleSave();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Initialize Profile Record (PUT)
          </button>
        </div>
      )}

      {/* State 3: Loaded Profile Card */}
      {profileState === 'loaded' && profile && (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={name}
                className="w-13 h-13 rounded-full object-cover border-2 border-slate-700 shadow-sm"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {name || 'Anonymous User'}
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  userId: {profile.userId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Bio Preview or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSave} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  BIO (STORED IN MONGODB: user_db)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes (PUT /api/users/profile)
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                BIO
              </span>
              {bio || '<No bio set yet>'}
            </div>
          )}

          {/* Database Meta */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Database: user_db.userprofiles</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {profile.updatedAt ? new Date(profile.updatedAt).toLocaleTimeString() : 'Recently'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
