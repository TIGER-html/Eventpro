import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin/users', icon: '👥', label: 'Utilisateurs' },
    { path: '/admin/events', icon: '🎉', label: 'Événements' },
    { path: '/admin/services', icon: '🛎️', label: 'Services' },
    { path: '/admin/payments', icon: '💳', label: 'Paiements' },
    { path: '/admin/refunds', icon: '💸', label: 'Remboursements' },
    { path: '/admin/commissions', icon: '💲', label: 'Commissions' },
    { path: '/admin/kyc', icon: '🔍', label: 'Vérifications KYC' },
    { path: '/admin/disputes', icon: '⚖️', label: 'Litiges' },
    { path: '/admin/gallery', icon: '🖼️', label: 'Galerie' },
    { path: '/admin/reviews', icon: '⭐', label: 'Avis' },
    { path: '/admin/notify', icon: '📢', label: 'Notifications' },
    { path: '/admin/settings', icon: '⚙️', label: 'Paramètres' },
  ];

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      location.pathname === path
        ? 'bg-accent-500 text-primary-950 shadow-md'
        : 'text-primary-200 hover:bg-primary-800 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-950 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}>
        <div className="p-6 border-b border-primary-800">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <span className="font-heading font-bold text-white text-sm">
              Admin <span className="text-accent-400">EventPro</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={linkClass(item.path)} onClick={() => setSidebarOpen(false)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-primary-950 font-bold text-sm">
              {user?.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.first_name}</p>
              <p className="text-accent-400 text-xs font-semibold">Administrateur</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-primary-300 hover:text-white hover:bg-primary-800 rounded-xl transition-colors">
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600 text-xl">☰</button>
          <h1 className="font-heading font-bold text-primary-900 text-lg hidden md:block">
            {navItems.find(i => i.path === location.pathname)?.label || 'Administration'}
          </h1>
          <span className="text-sm text-gray-600">Admin : <strong>{user?.first_name}</strong></span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;