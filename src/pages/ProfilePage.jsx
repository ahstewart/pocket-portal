import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import Button from '../components/Button';
import { ArrowLeftIcon, UserIcon, CodeBracketIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || '');
  const [userRole, setUserRole] = useState(user?.user_metadata?.userRole || 'user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        data: {
          name: displayName,
          userRole: userRole,
        },
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign out');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-600 mt-1">Manage your profile information</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* User Avatar & Email */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm text-slate-600">Email</p>
            <p className="text-lg font-medium text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-500 mt-1">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Display Name
              </div>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="h-4 w-4" />
                User Type
              </div>
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all" style={{borderColor: userRole === 'developer' ? '#0284c7' : '#cbd5e1', backgroundColor: userRole === 'developer' ? '#f0f7ff' : 'transparent'}}>
                <input
                  type="radio"
                  name="userRole"
                  value="developer"
                  checked={userRole === 'developer'}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-4 h-4 accent-primary-600"
                />
                <div>
                  <p className="font-medium text-slate-900">ML Engineer / Developer</p>
                  <p className="text-sm text-slate-600">I build and deploy AI models</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all" style={{borderColor: userRole === 'user' ? '#0284c7' : '#cbd5e1', backgroundColor: userRole === 'user' ? '#f0f7ff' : 'transparent'}}>
                <input
                  type="radio"
                  name="userRole"
                  value="user"
                  checked={userRole === 'user'}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-4 h-4 accent-primary-600"
                />
                <div>
                  <p className="font-medium text-slate-900">Everyday User</p>
                  <p className="text-sm text-slate-600">I use AI models on my phone</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Account Status</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium">Email Verified:</span>{' '}
                <span className="text-accent-lime font-medium">✓ Yes</span>
              </p>
              <p>
                <span className="font-medium">Account Type:</span> Free
              </p>
              <p>
                <span className="font-medium">Last Updated:</span> {new Date(user?.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setDisplayName(user?.user_metadata?.name || '')}
            >
              Reset
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700">
              Once you sign out, you'll need to sign in again with your credentials.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
