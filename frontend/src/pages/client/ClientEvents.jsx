import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientEvents() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'mariage', event_date: '', location: '', expected_guests: '', max_budget: '', theme_color: '#7c3aed' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/events', form);
      setSuccess('Événement créé avec succès !');
      setShowForm(false);
      setForm({ name: '', type: 'mariage', event_date: '', location: '', expected_guests: '', max_budget: '', theme_color: '#7c3aed' });
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  const eventTypes = [
    { value: 'mariage', label: 'Mariage', icon: '💍' },
    { value: 'anniversaire', label: 'Anniversaire', icon: '🎂' },
    { value: 'conference', label: 'Conférence', icon: '🎤' },
    { value: 'seminaire', label: 'Séminaire', icon: '📊' },
    { value: 'gala', label: 'Gala', icon: '🥂' },
    { value: 'autre', label: 'Autre', icon: '✨' },
  ];

  const typeIcons = { mariage: '💍', anniversaire: '🎂', conference: '🎤', seminaire: '📊', gala: '🥂', autre: '✨' };

  return (
    <ClientLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Mes événements</h1>
          <p className="text-gray-500 text-sm mt-1">{events.length} événement(s) au total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Créer un événement'}
        </button>
      </div>

      {success && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{success}</p>}
      {error && <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900 text-lg">Créer un événement</h2>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Nom de l'événement</label>
            <input name="name" placeholder="Ex: Mariage de Sarah & Paul" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">Type d'événement</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {eventTypes.map(t => (
                <button type="button" key={t.value} onClick={() => setForm({...form, type: t.value})}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${form.type === t.value ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-200' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  <span className="text-xl">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Date</label>
              <input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Lieu</label>
              <input placeholder="Ex: Yaoundé" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Invités attendus</label>
              <input type="number" placeholder="Ex: 150" value={form.expected_guests} onChange={e => setForm({...form, expected_guests: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Budget max (FCFA)</label>
              <input type="number" placeholder="Ex: 2000000" value={form.max_budget} onChange={e => setForm({...form, max_budget: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="color" value={form.theme_color} onChange={e => setForm({...form, theme_color: e.target.value})} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <span className="text-sm text-gray-500">Couleur du thème de l'événement</span>
          </div>

          <button type="submit" disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors disabled:opacity-60">
            {loading ? 'Création...' : "Créer l'événement"}
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">🎉</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Aucun événement</h2>
          <p className="text-gray-500 mb-6">Créez votre premier événement et laissez-nous vous accompagner.</p>
          <button onClick={() => setShowForm(true)} className="bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-colors">
            Créer mon premier événement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map(event => (
            <Link to={`/events/${event.id}`} key={event.id}
              className="bg-white rounded-2xl shadow-card hover:shadow-cardHover transition-all p-5 border border-gray-100 block group"
              style={{ borderTopColor: event.theme_color || '#7c3aed', borderTopWidth: '4px' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{typeIcons[event.type] || '✨'}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${new Date(event.event_date) >= new Date() ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {new Date(event.event_date) >= new Date() ? 'À venir' : 'Passé'}
                </span>
              </div>
              <h2 className="font-heading text-lg font-bold text-primary-900 group-hover:text-primary-700 transition-colors">{event.name}</h2>
              <p className="text-sm text-gray-500 mt-2">📅 {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-sm text-gray-500">📍 {event.location || 'Non précisé'}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm">
                <span className="text-gray-500">👥 {event.expected_guests} invités</span>
                <span className="font-semibold text-primary-700">{Number(event.max_budget).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}

export default ClientEvents;