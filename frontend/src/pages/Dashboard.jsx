import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        setError('Erreur lors du chargement des événements');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const typeLabels = {
    mariage: 'Mariage',
    anniversaire: 'Anniversaire',
    conference: 'Conférence',
    seminaire: 'Séminaire',
    gala: 'Gala / Dîner',
    autre: 'Autre',
  };

  const typeIcons = {
    mariage: '💍',
    anniversaire: '🎂',
    conference: '🎤',
    seminaire: '📊',
    gala: '🥂',
    autre: '✨',
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-primary-50 via-white to-accent-400/5 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary-900">Mes événements</h1>
            <p className="text-gray-500 mt-1">Gérez et suivez tous vos événements en un coup d'œil</p>
          </div>
          <Link
            to="/create-event"
            className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md transition-colors text-center"
          >
            + Créer un événement
          </Link>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm">{error}</p>
        )}

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : events.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-card text-center border border-primary-100">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">
              Aucun événement pour le moment
            </h2>
            <p className="text-gray-500 mb-6">Créez votre premier événement et laissez-nous vous accompagner pas à pas.</p>
            <Link
              to="/create-event"
              className="inline-block bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              Créer mon premier événement
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <Link
                to={`/events/${event.id}`}
                key={event.id}
                className="bg-white rounded-2xl shadow-card hover:shadow-cardHover transition-all p-5 border border-primary-100 block group"
                style={{ borderTopColor: event.theme_color || '#7c3aed', borderTopWidth: '4px' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{typeIcons[event.type] || '✨'}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {typeLabels[event.type] || event.type}
                  </span>
                </div>
                <h2 className="font-heading text-lg font-bold text-primary-900 group-hover:text-primary-700 transition-colors">
                  {event.name}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  📅 {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500">📍 {event.location || 'Lieu non précisé'}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm">
                  <span className="text-gray-500">👥 {event.expected_guests} invités</span>
                  <span className="font-semibold text-primary-700">{Number(event.max_budget).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <p className="text-primary-700 font-semibold mt-3 text-sm group-hover:translate-x-1 transition-transform inline-block">
                  Voir les détails →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;