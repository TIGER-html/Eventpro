import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ event_id: '', montant: '', methode: 'orange_money', transaction_id: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, eRes] = await Promise.all([api.get('/payments/my'), api.get('/events')]);
      setPayments(Array.isArray(pRes.data) ? pRes.data : []);
      setEvents(Array.isArray(eRes.data) ? eRes.data : []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/payments', form);
      setMessage('Paiement enregistré avec succès ! Il sera validé sous 24h.');
      setShowForm(false);
      setForm({ event_id: '', montant: '', methode: 'orange_money', transaction_id: '' });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors du paiement');
    } finally { setLoading(false); }
  };

  const statutBadge = (statut) => {
    const styles = {
      en_attente: 'bg-amber-50 text-amber-700 border border-amber-200',
      valide: 'bg-green-50 text-green-700 border border-green-200',
      refuse: 'bg-red-50 text-red-600 border border-red-200',
    };
    const labels = { en_attente: '⏳ En attente', valide: '✅ Validé', refuse: '❌ Refusé' };
    return { class: styles[statut] || styles.en_attente, label: labels[statut] || statut };
  };

  const methodeLabels = { orange_money: '🟠 Orange Money', mtn_momo: '🟡 MTN MoMo', presentiel: '💵 Présentiel' };

  const paymentInstructions = {
    orange_money: {
      title: '🟠 Paiement par Orange Money',
      numero: '+237 697 777 035',
      nom: 'NANDOUBA BENJAMIN',
      steps: [
        'Composez #150# sur votre téléphone (menu Orange Money)',
        'Choisissez "Transfert d\'argent" / "Envoyer de l\'argent"',
        `Entrez le numéro ${'+237 697 777 035'}`,
        'Entrez le montant exact de votre paiement',
        'Validez avec votre code secret Orange Money',
        'Vous recevrez un SMS avec un ID de transaction : copiez-le ci-dessous',
      ],
    },
    mtn_momo: {
      title: '🟡 Paiement par MTN Mobile Money',
      numero: '+237 683 724 238',
      nom: 'NANDOUBA BENJAMIN',
      steps: [
        'Composez *126# sur votre téléphone (menu MTN MoMo)',
        'Choisissez "Transfert" / "Envoyer de l\'argent"',
        `Entrez le numéro ${'+237 683 724 238'}`,
        'Entrez le montant exact de votre paiement',
        'Validez avec votre code secret MoMo',
        'Vous recevrez un SMS avec un ID de transaction : copiez-le ci-dessous',
      ],
    },
  };

  const totalPaye = payments.filter(p => p.statut === 'valide').reduce((acc, p) => acc + parseFloat(p.montant), 0);

  return (
    <ClientLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Paiements</h1>
          <p className="text-gray-500 text-sm mt-1">Total validé : <strong className="text-primary-700">{totalPaye.toLocaleString('fr-FR')} FCFA</strong></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Effectuer un paiement'}
        </button>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">Nouveau paiement</h2>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Événement concerné</label>
            <select value={form.event_id} onChange={e => setForm({...form, event_id: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" required>
              <option value="">-- Choisir un événement --</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Montant (FCFA)</label>
              <input type="number" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Méthode de paiement</label>
              <select value={form.methode} onChange={e => setForm({...form, methode: e.target.value, transaction_id: ''})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="orange_money">🟠 Orange Money</option>
                <option value="mtn_momo">🟡 MTN MoMo</option>
                <option value="presentiel">💵 Présentiel</option>
              </select>
            </div>
          </div>

          {/* Instructions de paiement selon la méthode */}
          {(form.methode === 'orange_money' || form.methode === 'mtn_momo') && (
            <div className={`rounded-xl p-4 border ${form.methode === 'orange_money' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className="font-semibold text-primary-900 mb-2">{paymentInstructions[form.methode].title}</p>

              <div className="bg-white rounded-lg p-3 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500">Numéro à créditer</p>
                  <p className="font-bold text-primary-900 text-lg">{paymentInstructions[form.methode].numero}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-500">Nom du bénéficiaire</p>
                  <p className="font-bold text-primary-900">{paymentInstructions[form.methode].nom}</p>
                </div>
              </div>

              <ol className="list-decimal list-inside text-sm text-gray-700 flex flex-col gap-1">
                {paymentInstructions[form.methode].steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <p className="text-xs text-gray-500 mt-3">
                ⚠️ Le montant transféré doit correspondre exactement au montant saisi ci-dessus, sinon la validation par l'administrateur pourra être refusée.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">
              {form.methode === 'presentiel' ? 'Référence / Note (optionnel)' : "ID de transaction reçu par SMS"}
            </label>
            <input
              placeholder={form.methode === 'presentiel' ? 'Ex: Reçu remis en main propre' : 'Ex: CM241234567890'}
              value={form.transaction_id}
              onChange={e => setForm({...form, transaction_id: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required={form.methode !== 'presentiel'}
            />
          </div>

          <button type="submit" disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors disabled:opacity-60">
            {loading ? 'Envoi...' : 'Confirmer le paiement'}
          </button>
        </form>
      )}

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">💳</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Aucun paiement</h2>
          <p className="text-gray-500">Vos paiements apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left font-medium text-gray-500">Événement</th>
                <th className="p-4 text-left font-medium text-gray-500">Méthode</th>
                <th className="p-4 text-left font-medium text-gray-500">Montant</th>
                <th className="p-4 text-left font-medium text-gray-500">Statut</th>
                <th className="p-4 text-left font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const badge = statutBadge(p.statut);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 font-medium text-primary-900">{p.event_name || '-'}</td>
                    <td className="p-4 text-gray-600">{methodeLabels[p.methode] || p.methode}</td>
                    <td className="p-4 font-bold text-primary-700">{Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-4"><span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.class}`}>{badge.label}</span></td>
                    <td className="p-4 text-gray-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ClientLayout>
  );
}

export default ClientPayments;