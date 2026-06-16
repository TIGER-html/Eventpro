import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminGallery() {
  const [gallery, setGallery] = useState([]);
  const [form, setForm] = useState({ url: '', type: 'photo', description: '' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/gallery/public');
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gallery', form);
      setMessage('Média ajouté !');
      setForm({ url: '', type: 'photo', description: '' });
      setShowForm(false);
      fetchGallery();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/gallery/${id}`);
      fetchGallery();
    } catch {}
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion de la galerie</h1>
          <p className="text-gray-500 mt-1">{gallery.length} média(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Ajouter un média'}
        </button>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">URL</label>
            <input placeholder="https://..." value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="photo">📷 Photo</option>
                <option value="video">🎥 Vidéo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors">Ajouter</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map(item => (
          <div key={item.id} className="rounded-2xl overflow-hidden aspect-square bg-primary-100 relative group">
            {item.type === 'photo' ? (
              <img src={item.url} alt={item.description || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-900 text-white text-4xl">🎥</div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export default AdminGallery;