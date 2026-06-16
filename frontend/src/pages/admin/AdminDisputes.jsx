import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [message, setMessage] = useState('');
  const [resolution, setResolution] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/admin-ext/disputes');
      setDisputes(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchDisputes(); }, []);

  const handleResolve = async (id, statut) => {
    try {
      await api.put(`/admin-ext/disputes/${id}/resolve`, { statut, resolution });
      setMessage('Litige résolu avec succès');
      setResolution('');
      fetchDisputes();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const filtered = filter === 'all' ? disputes : disputes.filter(d => d.statut === filter);

  const statusBadge = (s) => ({
    ouvert: 'bg-red-50 text-red-600',
    en_cours: 'bg-amber-50 text-amber-700',
    resolu: 'bg-green-50 text-green-700',
    ferme: 'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion des litiges</h1>
        <p className="text-gray-500 mt-1">Résolvez les conflits entre clients et prestataires</p>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'ouvert', 'en_cours', 'resolu'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {f === 'all' ? 'Tous' : f === 'ouvert' ? '🔴 Ouverts' : f === 'en_cours' ? '🟡 En cours' : '🟢 Résolus'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">⚖️</span>
          <p className="text-gray-500">Aucun litige dans cette catégorie.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-primary-900">{d.titre}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(d.statut)}`}>{d.statut}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Plaignant : {d.first_name} {d.last_name} • {d.email}</p>
                  <p className="text-gray-500 text-sm">Événement : {d.event_name} • {Number(d.agreed_price || 0).toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-gray-600 text-sm mt-2 italic">"{d.description}"</p>
                  {d.resolution && <p className="text-green-700 text-sm mt-2 font-medium">✅ Résolution : {d.resolution}</p>}
                  <p className="text-gray-400 text-xs mt-1">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              {d.statut !== 'resolu' && d.statut !== 'ferme' && (
                <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100">
                  <input value={resolution} onChange={e => setResolution(e.target.value)}
                    placeholder="Résolution / décision..."
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <button onClick={() => handleResolve(d.id, 'resolu')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                    ✅ Résoudre
                  </button>
                  <button onClick={() => handleResolve(d.id, 'ferme')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                    Fermer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDisputes;