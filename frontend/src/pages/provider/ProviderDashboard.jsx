import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderDashboard() {
  const [missions, setMissions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, pRes, nRes] = await Promise.all([
          api.get('/providers/my-missions'),
          api.get('/providers/my-profile'),
          api.get('/notifications'),
        ]);
        setMissions(Array.isArray(mRes.data) ? mRes.data : []);
        setProfile(pRes.data);
        setNotifications(Array.isArray(nRes.data) ? nRes.data.slice(0, 5) : []);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const pending = missions.filter(m => m.status === 'pending').length;
  const accepted = missions.filter(m => m.status === 'accepted').length;
  const paid = missions.filter(m => m.status === 'paid').length;
  const totalEarned = missions.filter(m => m.status === 'paid').reduce((acc, m) => acc + parseFloat(m.agreed_price || 0), 0);

  const stats = [
    { icon: '📋', label: 'Total missions', value: missions.length, color: 'bg-primary-50 text-primary-700' },
    { icon: '⏳', label: 'En attente', value: pending, color: 'bg-amber-50 text-amber-700' },
    { icon: '✅', label: 'Acceptées', value: accepted, color: 'bg-blue-50 text-blue-700' },
    { icon: '💰', label: 'Revenus', value: `${totalEarned.toLocaleString('fr-FR')} FCFA`, color: 'bg-green-50 text-green-700' },
  ];

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Bonjour, {user?.first_name} 👋</h1>
        <p className="text-gray-500 mt-1">Bienvenue dans votre espace prestataire</p>
      </div>

      {!profile && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">Profil incomplet</p>
            <p className="text-amber-700 text-sm">Créez votre profil prestataire pour apparaître dans le catalogue et recevoir des demandes.</p>
          </div>
          <Link to="/provider/profile" className="ml-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
            Créer mon profil
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-5 text-center`}>
            <span className="text-3xl block mb-2">{stat.icon}</span>
            <p className="text-xl font-bold font-heading">{stat.value}</p>
            <p className="text-xs font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-primary-900">Dernières missions</h2>
            <Link to="/provider/missions" className="text-primary-700 text-sm font-medium hover:underline">Voir tout</Link>
          </div>
          {missions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune mission reçue pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {missions.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xl shrink-0">🎉</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-900 text-sm truncate">{m.event_name}</p>
                    <p className="text-gray-400 text-xs">{new Date(m.event_date).toLocaleDateString('fr-FR')} • {m.location || 'N/A'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                    m.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    m.status === 'accepted' ? 'bg-blue-50 text-blue-700' :
                    m.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">Notifications récentes</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune notification</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded-xl text-sm ${n.lu ? 'bg-gray-50' : 'bg-primary-50 border border-primary-100'}`}>
                  <p className="font-semibold text-primary-900">{n.titre}</p>
                  <p className="text-gray-500 text-xs mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProviderLayout>
  );
}

export default ProviderDashboard;