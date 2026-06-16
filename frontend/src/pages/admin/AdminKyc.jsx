import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminKyc() {
  const [kycs, setKycs] = useState([]);
  const [message, setMessage] = useState('');
  const [noteAdmin, setNoteAdmin] = useState('');

  const fetchKycs = async () => {
    try {
      const res = await api.get('/admin-ext/kyc');
      setKycs(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchKycs(); }, []);

  const handleReview = async (id, statut) => {
    try {
      await api.put(`/admin-ext/kyc/${id}`, { statut, note_admin: noteAdmin });
      setMessage(`KYC ${statut === 'verifie' ? 'approuvé' : 'refusé'} avec succès`);
      setNoteAdmin('');
      fetchKycs();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const statusBadge = (statut) => ({
    en_attente: 'bg-amber-50 text-amber-700',
    verifie: 'bg-green-50 text-green-700',
    refuse: 'bg-red-50 text-red-600',
  }[statut] || 'bg-gray-100 text-gray-600');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Vérifications KYC</h1>
        <p className="text-gray-500 mt-1">Validez l'identité des prestataires</p>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      {kycs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-gray-500">Aucune demande KYC en attente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {kycs.map(k => (
            <div key={k.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-heading font-bold text-primary-900">{k.first_name} {k.last_name}</p>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(k.statut)}`}>{k.statut}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{k.email} • {k.service_type}</p>
                  <p className="text-gray-400 text-xs mt-1">Type de document : {k.document_type || 'Non précisé'}</p>
                  {k.document_url && (
                    <a href={k.document_url} target="_blank" rel="noopener noreferrer"
                      className="text-primary-700 text-sm font-medium hover:underline mt-1 inline-block">
                      📄 Voir le document
                    </a>
                  )}
                  {k.note_admin && <p className="text-sm text-gray-600 mt-1 italic">Note : {k.note_admin}</p>}
                  <p className="text-gray-400 text-xs mt-1">Soumis le {new Date(k.submitted_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {k.statut === 'en_attente' && (
                  <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
                    <input value={noteAdmin} onChange={e => setNoteAdmin(e.target.value)}
                      placeholder="Note (optionnel, si refus)"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button onClick={() => handleReview(k.id, 'verifie')}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                      ✅ Approuver
                    </button>
                    <button onClick={() => handleReview(k.id, 'refuse')}
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
    </AdminLayout>
  );
}

export default AdminKyc;