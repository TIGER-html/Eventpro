import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderProfile() {
  const [form, setForm] = useState({ service_type: '', description: '', price: '' });
  const [existing, setExisting] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/providers/my-profile');
        if (res.data) {
          setExisting(res.data);
          setForm({ service_type: res.data.service_type, description: res.data.description || '', price: res.data.price || '' });
        }
      } catch {}
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/providers', form);
      setMessage(existing ? 'Profil mis à jour avec succès !' : 'Profil créé avec succès ! Vous apparaissez maintenant dans le catalogue.');
      const res = await api.get('/providers/my-profile');
      if (res.data) setExisting(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  const serviceTypes = ['Traiteur', 'DJ / Musique', 'Photographe', 'Vidéaste', 'Décoration', 'Sécurité', 'Sonorisation', 'Animation', 'Transport', 'Fleuriste', 'Pâtisserie', 'Autre'];

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Mon profil prestataire</h1>
        <p className="text-gray-500 mt-1">
          {existing ? 'Mettez à jour vos informations de service' : 'Créez votre profil pour apparaître dans le catalogue'}
        </p>
      </div>

      {existing && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-800">Profil actif</p>
            <p className="text-green-700 text-sm">Vous apparaissez dans le catalogue. Note actuelle : ⭐ {existing.rating}/5</p>
          </div>
        </div>
      )}

      {message && (
        <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 max-w-2xl flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-primary-900 mb-1">Type de service</label>
          <select value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" required>
            <option value="">-- Choisissez votre type de service --</option>
            {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-900 mb-1">Description de votre service</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="4"
            placeholder="Décrivez votre expérience, vos équipements, ce qui vous distingue..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-900 mb-1">Tarif de base (FCFA)</label>
          <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
            placeholder="Ex: 150000"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
          <p className="text-xs text-gray-400 mt-1">Ce tarif sera visible dans le catalogue. Il peut être négocié avec chaque client.</p>
        </div>

        <button type="submit" disabled={loading}
          className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors disabled:opacity-60">
          {loading ? 'Enregistrement...' : existing ? '💾 Mettre à jour mon profil' : '✅ Créer mon profil'}
        </button>
      </form>
    </ProviderLayout>
  );
}

export default ProviderProfile;