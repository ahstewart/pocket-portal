import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { api } from './lib/api';
import { Box, UploadCloud, Play, Terminal, LogOut, User } from 'lucide-react';

// ==========================================
// 1. HELPERS & GUARDS
// ==========================================

// Guard: Only allows access if user is logged in
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ==========================================
// 2. AUTH SCREEN
// ==========================================
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    let error = null;

    if (isSignUp) {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error) alert('Success! Please check your email.');
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
      if (!error) {
         // Redirect to home on success
         navigate('/');
      }
    }

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Pocket AI Lab</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-gray-700">Email</label>
             <input type="email" required className="w-full p-2 border rounded mt-1" 
                value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Password</label>
             <input type="password" required minLength={6} className="w-full p-2 border rounded mt-1" 
                value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium">
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-blue-600 hover:underline">
            {isSignUp ? 'Have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. DASHBOARD (Public Gallery)
// ==========================================
function Dashboard() {
  const [models, setModels] = useState([]);
  
  useEffect(() => {
    // This now works even without a session because api.getModels is public
    api.getModels().then(setModels).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Model Registry</h2>
        {/* We hide the Upload button here; users must go to Studio or Login */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(m => (
          <div key={m.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{m.name}</h3>
                <span className="text-xs font-mono text-gray-500">{m.slug}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                m.category === 'utility' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {m.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-4 mb-6 line-clamp-2">{m.description_short}</p>
            
            <div className="flex gap-2">
                <Link to={`/playground/${m.id}`} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200 text-sm font-medium">
                  <Play size={16} /> Try It
                </Link>
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Terminal size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. UPLOAD WIZARD (Protected)
// ==========================================
function UploadWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', slug: '', description_short: '', description_long: '', category: 'utility',
    version_string: '1.0.0', changelog: 'Initial release',
    pipeline_json: '{\n  "input_nodes": ["input_1"],\n  "output_nodes": ["output_1"],\n  "pre_processing": [],\n  "post_processing": []\n}',
    assets_json: '[\n  {\n    "asset_key": "model_file",\n    "asset_type": "tflite",\n    "source_url": "https://...",\n    "file_hash": "sha256...",\n    "file_size_bytes": 0\n  }\n]'
  });

  const handleSubmit = async () => {
    try {
      const model = await api.createModel({
        name: formData.name, slug: formData.slug, 
        description_short: formData.description_short, description_long: formData.description_long, 
        category: formData.category
      });
      await api.createVersion(model.id, {
        version_string: formData.version_string, changelog: formData.changelog,
        pipeline_spec: JSON.parse(formData.pipeline_json), assets: JSON.parse(formData.assets_json)
      });
      navigate('/');
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8"><h2 className="text-2xl font-bold">Register New Model</h2></div>
      <div className="bg-white p-6 rounded-lg shadow border space-y-4">
        {step === 1 && (
          <>
            <input className="w-full p-2 border rounded" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="w-full p-2 border rounded" placeholder="Slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            <input className="w-full p-2 border rounded" placeholder="Short Desc" value={formData.description_short} onChange={e => setFormData({...formData, description_short: e.target.value})} />
            <textarea className="w-full p-2 border rounded h-32" placeholder="Long Desc" value={formData.description_long} onChange={e => setFormData({...formData, description_long: e.target.value})} />
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-2 rounded">Next</button>
          </>
        )}
        {step === 2 && (
          <>
             <textarea className="w-full p-2 border rounded h-48 text-xs font-mono" value={formData.pipeline_json} onChange={e => setFormData({...formData, pipeline_json: e.target.value})} />
             <textarea className="w-full p-2 border rounded h-32 text-xs font-mono" value={formData.assets_json} onChange={e => setFormData({...formData, assets_json: e.target.value})} />
             <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-2 rounded">Publish</button>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN LAYOUT (Conditional Nav)
// ==========================================
function Layout({ children, session }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-3">
            <Box className="text-blue-600" />
            <span className="font-bold text-xl tracking-tight">Pocket AI Lab</span>
        </Link>
        
        <div className="flex gap-6 text-sm font-medium text-gray-600 items-center">
            <Link to="/" className="hover:text-black">Registry</Link>
            
            {/* CONDITIONAL RENDERING STARTS HERE */}
            {session ? (
              <>
                <Link to="/upload" className="hover:text-black flex items-center gap-1">
                  <UploadCloud size={16} /> Studio
                </Link>
                <button onClick={handleLogout} className="hover:text-red-600 flex items-center gap-1">
                    <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center gap-2">
                <User size={16} /> Login
              </Link>
            )}
        </div>
      </nav>
      {children}
    </div>
  );
}

// ==========================================
// 6. ROUTER (The Wiring)
// ==========================================
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Pocket AI...</div>;

  return (
    <Router>
      <Layout session={session}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/playground/:id" element={<div className="p-10 text-center">Playground Coming Soon</div>} />
          
          {/* Protected Routes */}
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute session={session}>
                <UploadWizard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}