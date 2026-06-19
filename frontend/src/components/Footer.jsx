import { Link, useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el2 = document.getElementById(id);
        if (el2) el2.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const serviceCategories = [
    { label: '🎨 Décoration', id: 'services' },
    { label: '🎵 Sonorisation', id: 'services' },
    { label: '📷 Photographie', id: 'services' },
    { label: '🍽️ Traiteur', id: 'services' },
    { label: '🔒 Sécurité', id: 'services' },
    { label: '🎥 Vidéo', id: 'services' },
  ];

  return (
    <footer className="bg-primary-950 text-primary-200 pt-14 pb-6 mt-0">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎉</span>
              <span className="font-heading text-lg font-bold text-white">
                EventPro <span className="text-accent-400">Cameroun</span>
              </span>
            </div>
            <p className="text-sm text-primary-300 leading-relaxed">
              Organisez vos événements sans stress. La plateforme numéro 1 au Cameroun pour la gestion d'événements.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4">Navigation</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/" className="hover:text-accent-400 transition-colors">Accueil</Link></li>
              <li><button onClick={() => scrollToSection('services')} className="hover:text-accent-400 transition-colors text-left">Services</button></li>
              <li><button onClick={() => scrollToSection('galerie')} className="hover:text-accent-400 transition-colors text-left">Galerie</button></li>
              <li><button onClick={() => scrollToSection('temoignages')} className="hover:text-accent-400 transition-colors text-left">Témoignages</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="hover:text-accent-400 transition-colors text-left">Contact</button></li>
              <li><Link to="/about" className="hover:text-accent-400 transition-colors">À propos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4">Nos services</h4>
            <ul className="flex flex-col gap-2 text-sm">
              {serviceCategories.map((s, i) => (
                <li key={i}>
                  <button onClick={() => scrollToSection(s.id)} className="hover:text-accent-400 transition-colors text-left">
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4">Contact</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>📍 Yaoundé, Cameroun</li>
              <li>
                <a href="tel:+237600000000" className="hover:text-accent-400 transition-colors">
                  📞 +237 683 724 238
                </a>
              </li>
              <li>
                <a href="mailto:contact@eventpro-cameroun.com" className="hover:text-accent-400 transition-colors">
                  ✉️ contact@eventpro-cameroun.com
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-800 hover:bg-accent-500 hover:text-primary-950 flex items-center justify-center text-sm transition-colors font-bold">f</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-800 hover:bg-accent-500 hover:text-primary-950 flex items-center justify-center text-sm transition-colors">📸</a>
              <a href="https://wa.me/237600000000" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-800 hover:bg-accent-500 hover:text-primary-950 flex items-center justify-center text-sm transition-colors">💬</a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-primary-400">
          <p>© 2026 EventPro Cameroun. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-accent-400 transition-colors">À propos</Link>
            <a href="#" className="hover:text-accent-400 transition-colors">Conditions d'utilisation</a>
            <a href="#" className="hover:text-accent-400 transition-colors">Confidentialité</a>
            <button onClick={() => scrollToSection('contact')} className="hover:text-accent-400 transition-colors">FAQ</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;