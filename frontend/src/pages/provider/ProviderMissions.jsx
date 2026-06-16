import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderMissions() {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      const res = await api.get('/providers/my-missions');
      setMissions(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMissions(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/providers/${id}/status`, { status });
      setMessage(status === 'accepted' ? 'Mission acceptée !' : 'Mission refusée.');
      fetchMissions();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const filtered = filter === 'all' ? missions : missions.filter(m => m.status === filter);

  const statusInfo = {
    pending: { label: '⏳ En attente', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
    accepted: { label: '✅ Acceptée', class: 'bg-blue-50 text-blue-700 border border-blue-200' },
    paid: { label: '💰 Payée', class: 'bg-green-50 text-green-700 border border-green-200' },
    declined: { label: '❌ Refusée', class: 'bg-red-50 text-red-600 border border-red-200' },
  };

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Mes missions</h1>
        <p className="text-gray-500 mt-1">{missions.length} mission(s) au total</p>
      </div>

      {message && (
        <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('acceptée') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </p>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'pending', 'accepted', 'paid', 'declined'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {f === 'all' ? 'Toutes' : statusInfo[f]?.label || f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">📋</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Aucune mission</h2>
          <p className="text-gray-500">Les demandes de clients apparaîtront ici.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎉</span>
                    <h3 className="font-heading font-bold text-primary-900">{m.event_name}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo[m.status]?.class || 'bg-gray-100 text-gray-600'}`}>
                      {statusInfo[m.status]?.label || m.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm font-medium text-primary-900">{new Date(m.event_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Lieu</p>
                      <p className="text-sm font-medium text-primary-900">{m.location || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Client</p>
                      <p className="text-sm font-medium text-primary-900">{m.client_first_name} {m.client_last_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Prix convenu</p>
                      <p className="text-sm font-bold text-primary-700">{m.agreed_price ? `${Number(m.agreed_price).toLocaleString('fr-FR')} FCFA` : 'À négocier'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3 text-sm text-gray-500">
                    <span>📧 {m.client_email}</span>
                    <span>📞 {m.client_phone || 'N/A'}</span>
                  </div>
                </div>
                {m.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleStatus(m.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                      ✅ Accepter
                    </button>
                    <button onClick={() => handleStatus(m.id, 'declined')}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                      ❌ Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}

export default ProviderMissions;