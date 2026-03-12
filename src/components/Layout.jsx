// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { PlusIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { useAuth } from '../lib/authContext';

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { label: 'Home',        path: '/',            exact: true  },
    { label: 'Browse',      path: '/browse',      exact: false },
    { label: 'Get Started', path: '/get-started', exact: false },
    { label: 'Docs',        path: '/docs',        exact: false },
  ];

  const isActive = (path, exact) => {
    if (exact || path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setUserMenuOpen(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Side: Logo */}
            <div className="flex items-center gap-3 flex-1">
              <Link to="/" className="flex items-center group">
                <img
                  src="/logo-with-name.png"
                  alt="Jacana"
                  className="h-14 w-auto transition-all duration-200 group-hover:scale-105 drop-shadow-sm"
                />
              </Link>
            </div>

            {/* Center: Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path, link.exact)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side: CTA + Avatar */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {!user ? (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex gap-2"
                    onClick={() => navigate('/auth/login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary"
                    size="sm"
                    className="hidden sm:flex gap-2"
                    onClick={() => navigate('/auth/signup')}
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Button>
                </>
              ) : (
                <>
                  {/* User Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs text-slate-600">Signed in as</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { navigate('/models/create'); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <PlusIcon className="h-4 w-4" />
                            New Model
                          </div>
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
                            Dashboard
                          </div>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Account Settings
                          </div>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4 space-y-2 animate-slide-up">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path, link.exact)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center bg-slate-100 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition text-sm font-medium mt-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children || <Outlet />}
      </main>

      {/* FOOTER */}
      <footer className="bg-dark mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-3">
                <img src="/logo-with-name.png" alt="Jacana" className="h-12 w-auto brightness-0 invert" />
              </div>
              <p className="text-sm text-slate-400">Download and run mobile-optimized AI models.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-slate-400 hover:text-white transition">Home</Link></li>
                <li><Link to="/browse" className="text-slate-400 hover:text-white transition">Browse Models</Link></li>
                <li><Link to="/get-started" className="text-slate-400 hover:text-white transition">Get Started</Link></li>
                <li><Link to="/docs" className="text-slate-400 hover:text-white transition">Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">About</h4>
              <p className="text-sm text-slate-400">A platform for sharing and discovering mobile-optimized AI models for edge devices.</p>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 flex justify-between items-center">
            <p className="text-sm text-slate-400">© 2026 Jacana. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};