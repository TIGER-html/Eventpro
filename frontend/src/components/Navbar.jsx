import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/public');

  if (!isPublicPage && user) return null;

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${location.pathname === path ? 'text-accent-400' : 'text-primary-100 hover:text-white'}`;

  return (
    <nav className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-white">
          <span className="text-2xl">🎉</span>
          <span>EventPro <span className="text-accent-400">Cameroun</span></span>
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className={linkClass('/')}>Accueil</Link>
          <a href="/#services" className="text-sm font-medium text-primary-100 hover:text-white transition-colors">Services</a>
          <a href="/#galerie" className="text-sm font-medium text-primary-100 hover:text-white transition-colors">Galerie</a>
          <a href="/#temoignages" className="text-sm font-medium text-primary-100 hover:text-white transition-colors">Avis</a>
          <a href="/#contact" className="text-sm font-medium text-primary-100 hover:text-white transition-colors">Contact</a>

          {user ? (
            <div className="flex gap-3 items-center ml-4">
              <Link to="/client/dashboard" className="bg-primary-700 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                Mon espace
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  Admin
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-3 ml-4">
              <Link to="/login" className={linkClass('/login')}>Connexion</Link>
              <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-colors">
                Inscription
              </Link>
            </div>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-2xl">☰</button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-primary-900 border-t border-primary-800 px-6 py-4 flex flex-col gap-3">
          <Link to="/" className="text-primary-100 text-sm" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <a href="/#services" className="text-primary-100 text-sm" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/#contact" className="text-primary-100 text-sm" onClick={() => setMenuOpen(false)}>Contact</a>
          {user ? (
            <>
              <Link to="/client/dashboard" className="text-white font-semibold text-sm" onClick={() => setMenuOpen(false)}>Mon espace</Link>
              {user.role === 'admin' && <Link to="/admin/dashboard" className="text-accent-400 font-semibold text-sm" onClick={() => setMenuOpen(false)}>Admin</Link>}
            </>
          ) : (
            <>
              <Link to="/login" className="text-primary-100 text-sm" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/register" className="text-accent-400 font-semibold text-sm" onClick={() => setMenuOpen(false)}>Inscription</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;