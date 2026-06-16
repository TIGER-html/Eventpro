import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderKyc() {
  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({ document_type: 'CNI', document_url: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKyc = async () => {
    try {
      const res = await api.get('/provider-ext/kyc/status');
      setKyc(res.data);
    } catch {}
  };

  useEffect(() => { fetchKyc(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/provider-ext/kyc', form);
      setMessage('Document soumis ! L\'administrateur va vérifier votre identité sous 48h.');
      fetchKyc();
    } catch (err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 4000); }
  };

  const statusInfo = {
    en_attente: { icon: '⏳', label: 'En attente de vérification', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    verifie: { icon: '✅', label: 'Identité vérifiée — Badge obtenu !', color: 'bg-green-50 border-green-200 text-green-700' },
    refuse: { icon: '❌', label: 'Vérification refusée', color: 'bg-red-50 border-red-200 text-red-600' },
  };

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Vérification KYC</h1>
        <p className="text-gray-500 mt-1">Faites vérifier votre identité pour obtenir le badge ✅ Vérifié et gagner la confiance des clients</p>
      </div>

      {kyc && (
        <div className={`border rounded-2xl p-4 mb-6 ${statusInfo[kyc.statut]?.color || 'bg-gray-50 border-gray-200'}`}>
          <p className="font-bold text-lg">{statusInfo[kyc.statut]?.icon} {statusInfo[kyc.statut]?.label}</p>
          {kyc.note_admin && <p className="text-sm mt-1">Note de l'administrateur : {kyc.note_admin}</p>}
          {kyc.submitted_at && <p className="text-xs mt-1 opacity-70">Soumis le {new Date(kyc.submitted_at).toLocaleDateString('fr-FR')}</p>}
        </div>
      )}

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">
            {kyc?.statut === 'verifie' ? '✅ Votre identité est vérifiée' : kyc ? 'Resoumettre un document' : 'Soumettre un document'}
          </h2>

          {kyc?.statut === 'verifie' ? (
            <div className="text-center py-6">
              <span className="text-6xl block mb-3">🏅</span>
              <p className="font-semibold text-green-700">Félicitations ! Vous avez le badge Vérifié.</p>
              <p className="text-gray-500 text-sm mt-1">Votre profil inspire confiance aux clients.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-1">Type de document</label>
                <select value={form.document_type} onChange={e => setForm({...form, document_type: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="CNI">🪪 Carte Nationale d'Identité (CNI)</option>
                  <option value="Passeport">📕 Passeport</option>
                  <option value="Permis">🚗 Permis de conduire</option>
                  <option value="RCCM">📋 Registre de Commerce (RCCM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-1">URL du document (image scannée)</label>
                <input value={form.document_url} onChange={e => setForm({...form, document_url: e.target.value})}
                  placeholder="https://drive.google.com/... ou lien direct"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                <p className="text-xs text-gray-400 mt-1">Uploadez votre document sur Google Drive (partagé publiquement) et copiez le lien ici.</p>
              </div>
              <button type="submit" disabled={loading}
                className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                {loading ? 'Soumission...' : '📤 Soumettre pour vérification'}
              </button>
            </>
          )}
        </form>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">Pourquoi se faire vérifier ?</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: '🏅', title: 'Badge Vérifié', desc: 'Un badge ✅ apparaît sur votre profil dans le catalogue' },
              { icon: '🔝', title: 'Meilleur classement', desc: 'Vos services apparaissent en priorité dans les résultats' },
              { icon: '🤝', title: 'Confiance clients', desc: 'Les clients préfèrent les prestataires vérifiés' },
              { icon: '💰', title: 'Plus de missions', desc: 'Les prestataires vérifiés reçoivent en moyenne 40% plus de demandes' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-primary-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

export default ProviderKyc;