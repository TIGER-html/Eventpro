import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  const fetchCommissions = async () => {
    try {
      const res = await api.get('/admin-ext/commissions');
      setCommissions(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchCommissions(); }, []);

  const handleUpdate = async (id) => {
    const comm = commissions.find(c => c.id === id);
    try {
      await api.put(`/admin-ext/commissions/${id}`, { taux: comm.taux, description: comm.description, actif: comm.actif });
      setMessage('Commission mise à jour !');
      setEditing(null);
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const handleChange = (id, field, value) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Commissions dynamiques</h1>
        <p className="text-gray-500 mt-1">Gérez les taux de commission par catégorie de service</p>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commissions.map(c => (
            <div key={c.id} className={`border rounded-2xl p-4 ${c.actif ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-heading font-bold text-primary-900">{c.categorie}</h3>
                <div className="flex gap-2 items-center">
                  <button onClick={() => handleChange(c.id, 'actif', !c.actif)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${c.actif ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.actif ? '✅ Actif' : '❌ Inactif'}
                  </button>
                </div>
              </div>

              {editing === c.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 shrink-0">Taux (%)</label>
                    <input type="number" value={c.taux} step="0.5" min="0" max="50"
                      onChange={e => handleChange(c.id, 'taux', e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <input value={c.description || ''} onChange={e => handleChange(c.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(c.id)} className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                      💾 Sauvegarder
                    </button>
                    <button onClick={() => setEditing(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary-700">{c.taux}%</span>
                    <span className="text-gray-400 text-sm">de commission</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">{c.description}</p>
                  <button onClick={() => setEditing(c.id)} className="w-full bg-gray-50 hover:bg-primary-50 text-primary-700 font-semibold py-2 rounded-lg text-sm transition-colors border border-gray-100">
                    ✏️ Modifier
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCommissions;