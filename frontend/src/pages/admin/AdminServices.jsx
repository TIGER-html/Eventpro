import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', categorie: '', prix: '', description: '', image_url: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/services', form);
      setMessage('Service créé avec succès !');
      setForm({ nom: '', categorie: '', prix: '', description: '', image_url: '' });
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  const handleToggle = async (service) => {
    try {
      await api.put(`/services/${service.id}`, { ...service, actif: !service.actif });
      fetchServices();
    } catch {}
  };

  const categories = ['Décoration', 'Sonorisation', 'Photo/Vidéo', 'Sécurité', 'Traiteur', 'Autre'];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion des services</h1>
          <p className="text-gray-500 mt-1">{services.length} service(s) disponible(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Ajouter un service'}
        </button>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">Nouveau service</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Nom du service</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Catégorie</label>
              <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" required>
                <option value="">-- Choisir --</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Prix (FCFA)</label>
              <input type="number" value={form.prix} onChange={e => setForm({...form, prix: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Image URL (optionnel)</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="2"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <button type="submit" disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Création...' : 'Créer le service'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className={`bg-white rounded-2xl shadow-card border p-5 transition-colors ${service.actif ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{service.categorie}</span>
              <button onClick={() => handleToggle(service)} className={`text-xs font-semibold px-3 py-1 rounded-full ${service.actif ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {service.actif ? '✅ Actif' : '❌ Inactif'}
              </button>
            </div>
            <h3 className="font-heading font-bold text-primary-900 mt-2">{service.nom}</h3>
            <p className="text-gray-500 text-sm mt-1">{service.description}</p>
            <p className="font-bold text-primary-700 mt-3">{Number(service.prix).toLocaleString('fr-FR')} FCFA</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export default AdminServices;