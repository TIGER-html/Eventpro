import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientGallery() {
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [form, setForm] = useState({ url: '', type: 'photo', description: '' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gRes, eRes] = await Promise.all([api.get('/gallery/public'), api.get('/events')]);
        setGallery(Array.isArray(gRes.data) ? gRes.data : []);
        setEvents(Array.isArray(eRes.data) ? eRes.data : []);
      } catch {}
    };
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gallery', { ...form, event_id: selectedEvent || null });
      setMessage('Média ajouté avec succès !');
      setForm({ url: '', type: 'photo', description: '' });
      setShowForm(false);
      const res = await api.get('/gallery/public');
      setGallery(Array.isArray(res.data) ? res.data : []);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <ClientLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Galerie</h1>
          <p className="text-gray-500 mt-1">Photos et vidéos de vos événements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Ajouter un média'}
        </button>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">Ajouter un média</h2>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">URL de l'image / vidéo</label>
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
              <label className="block text-sm font-medium text-primary-900 mb-1">Événement (optionnel)</label>
              <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">-- Aucun --</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Description</label>
            <input placeholder="Description du média" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors">
            Ajouter
          </button>
        </form>
      )}

      {gallery.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">🖼️</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Aucun média</h2>
          <p className="text-gray-500">Ajoutez des photos et vidéos de vos événements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map(item => (
            <div key={item.id} className="rounded-2xl overflow-hidden aspect-square bg-primary-100 relative group">
              {item.type === 'photo' ? (
                <img src={item.url} alt={item.description || 'Média'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-900 text-white text-4xl">🎥</div>
              )}
              {item.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}

export default ClientGallery;