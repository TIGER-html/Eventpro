import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments/admin/all');
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleStatusChange = async (id, statut) => {
    try {
      await api.put(`/payments/${id}/status`, { statut });
      setMessage(`Paiement ${statut === 'valide' ? 'validé' : 'refusé'} avec succès`);
      fetchPayments();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const filtered = filter === 'all' ? payments : payments.filter(p => p.statut === filter);
  const totalValide = payments.filter(p => p.statut === 'valide').reduce((acc, p) => acc + parseFloat(p.montant), 0);
  const totalAttente = payments.filter(p => p.statut === 'en_attente').reduce((acc, p) => acc + parseFloat(p.montant), 0);

  const statutBadge = (statut) => ({
    en_attente: { class: 'bg-amber-50 text-amber-700', label: '⏳ En attente' },
    valide: { class: 'bg-green-50 text-green-700', label: '✅ Validé' },
    refuse: { class: 'bg-red-50 text-red-600', label: '❌ Refusé' },
  }[statut] || { class: 'bg-gray-100 text-gray-600', label: statut });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion des paiements</h1>
        <p className="text-gray-500 mt-1">{payments.length} paiement(s) au total</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">Total validé</p>
          <p className="text-lg font-bold text-green-700">{totalValide.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">En attente</p>
          <p className="text-lg font-bold text-amber-700">{totalAttente.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      <div className="flex gap-2 mb-4">
        {['all', 'en_attente', 'valide', 'refuse'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {f === 'all' ? 'Tous' : f === 'en_attente' ? 'En attente' : f === 'valide' ? 'Validés' : 'Refusés'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left font-medium text-gray-500">Client</th>
              <th className="p-4 text-left font-medium text-gray-500">Événement</th>
              <th className="p-4 text-left font-medium text-gray-500">Montant</th>
              <th className="p-4 text-left font-medium text-gray-500">Méthode</th>
              <th className="p-4 text-left font-medium text-gray-500">Statut</th>
              <th className="p-4 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const badge = statutBadge(p.statut);
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-primary-900">{p.first_name} {p.last_name}</p>
                    <p className="text-gray-400 text-xs">{p.email}</p>
                  </td>
                  <td className="p-4 text-gray-600">{p.event_name || '-'}</td>
                  <td className="p-4 font-bold text-primary-700">{Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4 text-gray-600">{p.methode}</td>
                  <td className="p-4"><span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.class}`}>{badge.label}</span></td>
                  <td className="p-4">
                    {p.statut === 'en_attente' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(p.id, 'valide')} className="text-green-600 hover:text-green-700 text-xs font-semibold">Valider</button>
                        <button onClick={() => handleStatusChange(p.id, 'refuse')} className="text-red-500 hover:text-red-700 text-xs font-semibold">Refuser</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminPayments;