import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchRefunds = async () => {
    try {
      const res = await api.get('/admin-ext/refunds');
      setRefunds(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchRefunds(); }, []);

  const handleProcess = async (id, statut) => {
    try {
      await api.put(`/admin-ext/refunds/${id}/process`, { statut });
      setMessage(`Remboursement ${statut === 'approuve' ? 'approuvé' : 'refusé'}`);
      fetchRefunds();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const filtered = filter === 'all' ? refunds : refunds.filter(r => r.statut === filter);
  const statusBadge = (s) => ({
    en_attente: 'bg-amber-50 text-amber-700',
    approuve: 'bg-green-50 text-green-700',
    refuse: 'bg-red-50 text-red-600',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Remboursements</h1>
        <p className="text-gray-500 mt-1">Traitez les demandes de remboursement</p>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'en_attente', 'approuve', 'refuse'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {f === 'all' ? 'Tous' : f === 'en_attente' ? '⏳ En attente' : f === 'approuve' ? '✅ Approuvés' : '❌ Refusés'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">💸</span>
          <p className="text-gray-500">Aucun remboursement dans cette catégorie.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left font-medium text-gray-500">Client</th>
                <th className="p-4 text-left font-medium text-gray-500">Montant</th>
                <th className="p-4 text-left font-medium text-gray-500">Raison</th>
                <th className="p-4 text-left font-medium text-gray-500">Méthode</th>
                <th className="p-4 text-left font-medium text-gray-500">Statut</th>
                <th className="p-4 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-primary-900">{r.first_name} {r.last_name}</p>
                    <p className="text-gray-400 text-xs">{r.email}</p>
                  </td>
                  <td className="p-4 font-bold text-primary-700">{Number(r.montant).toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4 text-gray-600 text-xs max-w-[150px] truncate">{r.raison || '-'}</td>
                  <td className="p-4 text-gray-600 text-xs">{r.methode}</td>
                  <td className="p-4"><span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(r.statut)}`}>{r.statut}</span></td>
                  <td className="p-4">
                    {r.statut === 'en_attente' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleProcess(r.id, 'approuve')} className="text-green-600 hover:text-green-700 text-xs font-semibold">Approuver</button>
                        <button onClick={() => handleProcess(r.id, 'refuse')} className="text-red-500 hover:text-red-700 text-xs font-semibold">Refuser</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminRefunds;