import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './lib/authContext';
import { HomePage } from './pages/HomePage';
import { BrowseModelsPage } from './pages/BrowseModelsPage';
import { UploadModelPage } from './pages/UploadModelPage';
import { ModelDetailPage } from './pages/ModelDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes (no layout) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />

          {/* Main Routes (with layout) */}
          <Route
            element={<Layout />}
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseModelsPage />} />
            <Route path="/models/:id" element={<ModelDetailPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/models/create"
              element={
                <ProtectedRoute>
                  <UploadModelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;