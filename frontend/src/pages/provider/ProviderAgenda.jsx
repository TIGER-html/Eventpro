import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderAgenda() {
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({ date_debut: '', date_fin: '', statut: 'bloque', note: '' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/provider-ext/availability');
      setAvailability(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchAvailability(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/provider-ext/availability', form);
      setMessage('Période ajoutée à votre agenda !');
      setForm({ date_debut: '', date_fin: '', statut: 'bloque', note: '' });
      setShowForm(false);
      fetchAvailability();
    } catch (err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/provider-ext/availability/${id}`);
      fetchAvailability();
    } catch {}
  };

  const statutBadge = (s) => ({
    bloque: 'bg-red-50 text-red-600',
    disponible: 'bg-green-50 text-green-700',
    reserve: 'bg-blue-50 text-blue-700',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <ProviderLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Mon agenda</h1>
          <p className="text-gray-500 mt-1">Gérez vos disponibilités et évitez les double-réservations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Ajouter une période'}
        </button>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">Nouvelle période</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Date de début</label>
              <input type="date" value={form.date_debut} onChange={e => setForm({...form, date_debut: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Date de fin</label>
              <input type="date" value={form.date_fin} onChange={e => setForm({...form, date_fin: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Statut</label>
            <select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="bloque">🔴 Bloqué (indisponible)</option>
              <option value="disponible">🟢 Disponible</option>
              <option value="reserve">🔵 Réservé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Note (optionnel)</label>
            <input value={form.note} onChange={e => setForm({...form, note: e.target.value})}
              placeholder="Ex: Vacances, Mission confirmée..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Enregistrement...' : 'Ajouter à l\'agenda'}
          </button>
        </form>
      )}

      {availability.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">📅</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Agenda vide</h2>
          <p className="text-gray-500">Ajoutez vos périodes de disponibilité ou d'indisponibilité.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {availability.map(a => (
            <div key={a.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 flex items-center gap-4">
              <div className={`w-3 h-12 rounded-full ${a.statut === 'bloque' ? 'bg-red-400' : a.statut === 'disponible' ? 'bg-green-400' : 'bg-blue-400'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statutBadge(a.statut)}`}>{a.statut}</span>
                </div>
                <p className="font-semibold text-primary-900">
                  {new Date(a.date_debut).toLocaleDateString('fr-FR')} → {new Date(a.date_fin).toLocaleDateString('fr-FR')}
                </p>
                {a.note && <p className="text-gray-500 text-sm">{a.note}</p>}
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-sm font-medium">Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}

export default ProviderAgenda;