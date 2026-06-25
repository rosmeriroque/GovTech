import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inbox } from './pages/Inbox';
import { Portal } from './pages/Portal';
import { Landing } from './pages/Landing';
import { Verify } from './pages/Verify';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !user.es_admin) return <Navigate to="/dashboard/inbox" replace />;
  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Admin only route */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route index element={<Dashboard />} />
          </Route>
          {/* Routes for both admin and normal users */}
          <Route path="inbox" element={<Inbox />} />
          <Route path="portal" element={<Portal />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
