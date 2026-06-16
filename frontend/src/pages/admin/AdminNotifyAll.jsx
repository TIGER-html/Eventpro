import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminNotifyAll() {
  const [form, setForm] = useState({ titre: '', message: '', cible: 'tous' });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/admin-ext/global-notifications');
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await api.post('/admin-ext/notify-all', form);
      setMessage(`✅ Notification envoyée à ${res.data.count} utilisateur(s) !`);
      setForm({ titre: '', message: '', cible: 'tous' });
      fetchHistory();
    } catch { setMessage('Erreur lors de l\'envoi'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 4000); }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Notifications globales</h1>
        <p className="text-gray-500 mt-1">Envoyez des annonces à tous les utilisateurs ou à une catégorie</p>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">📢 Nouvelle notification</h2>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Destinataires</label>
            <select value={form.cible} onChange={e => setForm({...form, cible: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="tous">👥 Tous les utilisateurs</option>
              <option value="clients">🎉 Clients uniquement</option>
              <option value="prestataires">🛎️ Prestataires uniquement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Titre</label>
            <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})}
              placeholder="Ex: Nouvelle fonctionnalité disponible !"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Message</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Contenu de la notification..." rows="4"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" required />
          </div>

          <button type="submit" disabled={loading}
            className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Envoi en cours...' : '📢 Envoyer la notification'}
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">📋 Historique des envois</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune notification envoyée pour le moment.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {history.map(h => (
                <div key={h.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-primary-900 text-sm">{h.titre}</p>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full shrink-0 ml-2">{h.cible}</span>
                  </div>
                  <p className="text-gray-500 text-xs">{h.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(h.created_at).toLocaleString('fr-FR')} • par {h.first_name} {h.last_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminNotifyAll;