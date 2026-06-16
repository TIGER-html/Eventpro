import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import EventReport from './pages/EventReport';
import PublicEvent from './pages/PublicEvent';

import ClientDashboard from './pages/client/ClientDashboard';
import ClientEvents from './pages/client/ClientEvents';
import ClientServices from './pages/client/ClientServices';
import ClientPayments from './pages/client/ClientPayments';
import ClientInvitations from './pages/client/ClientInvitations';
import ClientMessages from './pages/client/ClientMessages';
import ClientGallery from './pages/client/ClientGallery';
import ClientProfile from './pages/client/ClientProfile';
import ClientSettings from './pages/client/ClientSettings';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminServices from './pages/admin/AdminServices';
import AdminPayments from './pages/admin/AdminPayments';
import AdminGallery from './pages/admin/AdminGallery';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminKyc from './pages/admin/AdminKyc';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminRefunds from './pages/admin/AdminRefunds';
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminNotifyAll from './pages/admin/AdminNotifyAll';

import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderMissions from './pages/provider/ProviderMissions';
import ProviderRevenues from './pages/provider/ProviderRevenues';
import ProviderAgenda from './pages/provider/ProviderAgenda';
import ProviderGallery from './pages/provider/ProviderGallery';
import ProviderPacks from './pages/provider/ProviderPacks';
import ProviderKyc from './pages/provider/ProviderKyc';
import ProviderMessages from './pages/provider/ProviderMessages';
import ProviderSettings from './pages/provider/ProviderSettings';

function PublicLayout({ children }) {
  return <><Navbar />{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ═══ PAGES PUBLIQUES ═══ */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/public/event/:id" element={<PublicEvent />} />
        <Route path="/events/:id" element={<PublicLayout><EventDetails /></PublicLayout>} />
        <Route path="/events/:id/report" element={<PublicLayout><EventReport /></PublicLayout>} />

        {/* ═══ ESPACE CLIENT ═══ */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/events" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientEvents />
          </ProtectedRoute>
        } />
        <Route path="/client/services" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientServices />
          </ProtectedRoute>
        } />
        <Route path="/client/payments" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientPayments />
          </ProtectedRoute>
        } />
        <Route path="/client/invitations" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientInvitations />
          </ProtectedRoute>
        } />
        <Route path="/client/messages" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientMessages />
          </ProtectedRoute>
        } />
        <Route path="/client/gallery" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientGallery />
          </ProtectedRoute>
        } />
        <Route path="/client/profile" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientProfile />
          </ProtectedRoute>
        } />
        <Route path="/client/settings" element={
          <ProtectedRoute allowedRoles={['client', 'organisateur']}>
            <ClientSettings />
          </ProtectedRoute>
        } />

        {/* ═══ ESPACE PRESTATAIRE ═══ */}
        <Route path="/provider/dashboard" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderDashboard />
          </ProtectedRoute>
        } />
        <Route path="/provider/profile" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderProfile />
          </ProtectedRoute>
        } />
        <Route path="/provider/missions" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderMissions />
          </ProtectedRoute>
        } />
        <Route path="/provider/revenues" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderRevenues />
          </ProtectedRoute>
        } />
        <Route path="/provider/agenda" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderAgenda />
          </ProtectedRoute>
        } />
        <Route path="/provider/gallery" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderGallery />
          </ProtectedRoute>
        } />
        <Route path="/provider/packs" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderPacks />
          </ProtectedRoute>
        } />
        <Route path="/provider/kyc" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderKyc />
          </ProtectedRoute>
        } />
        <Route path="/provider/messages" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderMessages />
          </ProtectedRoute>
        } />
        <Route path="/provider/settings" element={
          <ProtectedRoute allowedRoles={['prestataire']}>
            <ProviderSettings />
          </ProtectedRoute>
        } />

        {/* ═══ ESPACE ADMIN ═══ */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminEvents />
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminServices />
          </ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPayments />
          </ProtectedRoute>
        } />
        <Route path="/admin/refunds" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRefunds />
          </ProtectedRoute>
        } />
        <Route path="/admin/commissions" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCommissions />
          </ProtectedRoute>
        } />
        <Route path="/admin/kyc" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminKyc />
          </ProtectedRoute>
        } />
        <Route path="/admin/disputes" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDisputes />
          </ProtectedRoute>
        } />
        <Route path="/admin/gallery" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminGallery />
          </ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReviews />
          </ProtectedRoute>
        } />
        <Route path="/admin/notify" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminNotifyAll />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        } />

        {/* ═══ REDIRECTIONS ═══ */}
        <Route path="/dashboard" element={<Navigate to="/client/dashboard" />} />
        <Route path="/create-event" element={<Navigate to="/client/events" />} />
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;