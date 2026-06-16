import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateEvent() {
  const [form, setForm] = useState({
    name: '',
    type: 'mariage',
    event_date: '',
    location: '',
    expected_guests: '',
    max_budget: '',
    theme_color: '#7c3aed'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/events', form);
      setSuccess('Événement créé avec succès !');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: 'mariage', label: 'Mariage', icon: '💍' },
    { value: 'anniversaire', label: 'Anniversaire', icon: '🎂' },
    { value: 'conference', label: 'Conférence', icon: '🎤' },
    { value: 'seminaire', label: 'Séminaire', icon: '📊' },
    { value: 'gala', label: 'Gala / Dîner', icon: '🥂' },
    { value: 'autre', label: 'Autre', icon: '✨' },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-primary-50 via-white to-accent-400/5 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-3xl font-bold text-primary-900">Créer un événement</h1>
          <p className="text-gray-500 mt-1">Renseignez les informations de base, vous pourrez tout modifier ensuite</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-8 flex flex-col gap-5">
          {error && (
            <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm">{error}</p>
          )}
          {success && (
            <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg text-sm">{success}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Nom de l'événement</label>
            <input
              name="name"
              placeholder="Ex: Mariage de Sarah & Paul"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">Type d'événement</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {eventTypes.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
                    form.type === t.value
                      ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Date</label>
              <input
                name="event_date"
                type="date"
                value={form.event_date}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Lieu</label>
              <input
                name="location"
                placeholder="Ex: Yaoundé"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Invités attendus</label>
              <input
                name="expected_guests"
                type="number"
                placeholder="Ex: 150"
                value={form.expected_guests}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Budget max (FCFA)</label>
              <input
                name="max_budget"
                type="number"
                placeholder="Ex: 2000000"
                value={form.max_budget}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Couleur du thème</label>
            <div className="flex items-center gap-3">
              <input
                name="theme_color"
                type="color"
                value={form.theme_color}
                onChange={handleChange}
                className="w-14 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-500">Cette couleur personnalisera la page de votre événement</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Création...' : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;