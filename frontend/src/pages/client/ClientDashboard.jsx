import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientDashboard() {
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, nRes] = await Promise.all([
          api.get('/events'),
          api.get('/notifications'),
        ]);
        setEvents(Array.isArray(eRes.data) ? eRes.data : []);
        setNotifications(Array.isArray(nRes.data) ? nRes.data.slice(0, 5) : []);
      } catch {}
    };
    fetchData();
  }, []);

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  const stats = [
    { icon: '🎉', label: 'Total événements', value: events.length, color: 'bg-primary-50 text-primary-700' },
    { icon: '📅', label: 'À venir', value: upcomingEvents.length, color: 'bg-blue-50 text-blue-700' },
    { icon: '✅', label: 'Passés', value: pastEvents.length, color: 'bg-green-50 text-green-700' },
    { icon: '🔔', label: 'Notifications', value: notifications.filter(n => !n.lu).length, color: 'bg-accent-500/10 text-accent-600' },
  ];

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">
          Bonjour, {user?.first_name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Bienvenue dans votre espace EventPro Cameroun</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-5 text-center`}>
            <span className="text-3xl block mb-2">{stat.icon}</span>
            <p className="text-2xl font-bold font-heading">{stat.value}</p>
            <p className="text-xs font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-primary-900">Mes événements à venir</h2>
            <Link to="/client/events" className="text-primary-700 text-sm font-medium hover:underline">Voir tout</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">Aucun événement à venir</p>
              <Link to="/client/events" className="bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors">
                Créer un événement
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingEvents.slice(0, 3).map(e => (
                <Link to={`/events/${e.id}`} key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xl shrink-0">🎉</div>
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">{e.name}</p>
                    <p className="text-gray-400 text-xs">{new Date(e.event_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-bold text-primary-900">Notifications récentes</h2>
          </div>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune notification</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded-xl text-sm ${n.lu ? 'bg-gray-50' : 'bg-primary-50 border border-primary-100'}`}>
                  <p className="font-semibold text-primary-900">{n.titre}</p>
                  <p className="text-gray-500 text-xs mt-1">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <h3 className="font-heading font-bold text-lg mb-2">Créez votre prochain événement</h3>
        <p className="text-primary-200 text-sm mb-4">Mariages, anniversaires, conférences... Nous gérons tout pour vous.</p>
        <Link to="/client/events" className="inline-block bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          + Créer un événement
        </Link>
      </div>
    </ClientLayout>
  );
}

export default ClientDashboard;