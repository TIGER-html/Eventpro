import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderPacks() {
  const [packs, setPacks] = useState([]);
  const [form, setForm] = useState({ nom: '', description: '', prix: '', inclus: '' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchPacks = async () => {
    try {
      const res = await api.get('/provider-ext/packs');
      setPacks(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchPacks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      if (editing) {
        await api.put(`/provider-ext/packs/${editing}`, { ...form, actif: true });
        setMessage('Pack mis à jour !');
        setEditing(null);
      } else {
        await api.post('/provider-ext/packs', form);
        setMessage('Pack créé avec succès !');
      }
      setForm({ nom: '', description: '', prix: '', inclus: '' });
      setShowForm(false);
      fetchPacks();
    } catch (err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleEdit = (pack) => {
    setForm({ nom: pack.nom, description: pack.description || '', prix: pack.prix, inclus: pack.inclus || '' });
    setEditing(pack.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/provider-ext/packs/${id}`);
      fetchPacks();
    } catch {}
  };

  const handleToggle = async (pack) => {
    try {
      await api.put(`/provider-ext/packs/${pack.id}`, { ...pack, actif: !pack.actif });
      fetchPacks();
    } catch {}
  };

  return (
    <ProviderLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Mes packs & offres</h1>
          <p className="text-gray-500 mt-1">Proposez des offres packagées pour attirer plus de clients</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ nom: '', description: '', prix: '', inclus: '' }); }}
          className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Créer un pack'}
        </button>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">{editing ? 'Modifier le pack' : 'Nouveau pack'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Nom du pack</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                placeholder="Ex: Pack Mariage Complet"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Prix (FCFA)</label>
              <input type="number" value={form.prix} onChange={e => setForm({...form, prix: e.target.value})}
                placeholder="Ex: 500000"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="2"
              placeholder="Décrivez ce pack..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Ce qui est inclus</label>
            <textarea value={form.inclus} onChange={e => setForm({...form, inclus: e.target.value})} rows="3"
              placeholder="Ex: Décoration salle + Décoration extérieur + Fleurs + 5h de prestation"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Enregistrement...' : editing ? '💾 Mettre à jour' : '✅ Créer le pack'}
          </button>
        </form>
      )}

      {packs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">📦</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Aucun pack</h2>
          <p className="text-gray-500 mb-4">Créez des offres packagées pour simplifier le choix de vos clients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map(pack => (
            <div key={pack.id} className={`bg-white rounded-2xl shadow-card border p-5 ${pack.actif ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-heading font-bold text-primary-900">{pack.nom}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(pack)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${pack.actif ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pack.actif ? '✅ Actif' : '❌ Inactif'}
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-700 mb-2">{Number(pack.prix).toLocaleString('fr-FR')} FCFA</p>
              {pack.description && <p className="text-gray-500 text-sm mb-2">{pack.description}</p>}
              {pack.inclus && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Inclus :</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{pack.inclus}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleEdit(pack)} className="flex-1 bg-gray-50 hover:bg-primary-50 text-primary-700 font-semibold py-2 rounded-lg text-sm transition-colors border border-gray-100">
                  ✏️ Modifier
                </button>
                <button onClick={() => handleDelete(pack.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded-lg text-sm transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}

export default ProviderPacks;