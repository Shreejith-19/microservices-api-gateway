import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Shield, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { MOCK_USER_PROFILE, PLACEHOLDER_NOTICE } from '../../utils/mockData';

export const ProfileSection = () => {
  const [profileState, setProfileState] = useState('loaded'); // 'loaded' | 'empty' | 'loading'
  const [isEditing, setIsEditing] = useState(false);

  // Form inputs
  const [name, setName] = useState(MOCK_USER_PROFILE.name);
  const [bio, setBio] = useState(MOCK_USER_PROFILE.bio);
  const [profilePicture, setProfilePicture] = useState(MOCK_USER_PROFILE.profilePicture);

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

        {/* State Simulator Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800 text-[11px]">
          <span className="text-slate-500 font-mono text-[10px] px-1">STATE:</span>
          <button
            type="button"
            onClick={() => { setProfileState('loaded'); setIsEditing(false); }}
            className={`px-2 py-0.5 rounded transition-all font-mono ${
              profileState === 'loaded' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            200 OK
          </button>
          <button
            type="button"
            onClick={() => { setProfileState('empty'); setIsEditing(false); }}
            className={`px-2 py-0.5 rounded transition-all font-mono ${
              profileState === 'empty' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            404 Empty
          </button>
          <button
            type="button"
            onClick={() => setProfileState('loading')}
            className={`px-2 py-0.5 rounded transition-all font-mono ${
              profileState === 'loading' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Skeleton
          </button>
        </div>
      </div>

      {/* Gateway Identity Forwarding Callout */}
      <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Gateway forwards verified identity header:</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 text-[11px]">
            x-user-id: {MOCK_USER_PROFILE.userId.slice(0, 10)}...
          </span>
        </div>
      </div>

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
            Because Auth Service and User Service use isolated databases, a new user must perform a <code className="text-amber-300 font-mono">PUT /api/users/profile</code> upsert to initialize their profile record.
          </p>
          <button
            type="button"
            onClick={() => { setProfileState('loaded'); setIsEditing(true); }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Initialize Profile Record (PUT)
          </button>
        </div>
      )}

      {/* State 3: Loaded Profile Card */}
      {profileState === 'loaded' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={profilePicture}
                alt={name}
                className="w-13 h-13 rounded-full object-cover border-2 border-slate-700 shadow-sm"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {name}
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {MOCK_USER_PROFILE.email}
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
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
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
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes (PUT /api/users/profile)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                BIO
              </span>
              {bio}
            </div>
          )}

          {/* Database Meta */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Database: user_db.userprofiles</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated 22m ago
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;

