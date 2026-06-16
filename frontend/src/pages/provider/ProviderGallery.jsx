import { useEffect, useState, useRef } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderGallery() {
  const [gallery, setGallery] = useState([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadMode, setUploadMode] = useState('file');
  const [form, setForm] = useState({ url: '', type: 'photo', description: '', base64Data: '', fileName: '' });
  const fileInputRef = useRef();

  const fetchGallery = async () => {
    try {
      const res = await api.get('/provider-ext/gallery');
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setForm(prev => ({ ...prev, type: isVideo ? 'video' : 'photo', fileName: file.name }));
    const reader = new FileReader();
    reader.onload = (evt) => {
      setForm(prev => ({ ...prev, base64Data: evt.target.result, fileName: file.name }));
      setPreview(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (uploadMode === 'file' && !form.base64Data) { setMessage('Veuillez sélectionner un fichier.'); return; }
    if (uploadMode === 'url' && !form.url) { setMessage('Veuillez entrer une URL.'); return; }
    setLoading(true); setMessage('');
    try {
      await api.post('/provider-ext/gallery', form);
      setMessage('Média ajouté à votre galerie !');
      setForm({ url: '', type: 'photo', description: '', base64Data: '', fileName: '' });
      setPreview(null);
      setShowForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchGallery();
    } catch (err) { setMessage(err.response?.data?.message || 'Erreur lors de l\'ajout'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/provider-ext/gallery/${id}`);
      fetchGallery();
    } catch {}
  };

  const getImageSrc = (url) => {
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <ProviderLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Galerie de réalisations</h1>
          <p className="text-gray-500 mt-1">Montrez votre travail pour attirer plus de clients</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setPreview(null); }}
          className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors">
          {showForm ? '✕ Annuler' : '+ Ajouter un média'}
        </button>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-heading font-bold text-primary-900">Ajouter un média</h2>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setUploadMode('file'); setPreview(null); setForm(prev => ({ ...prev, url: '', base64Data: '', fileName: '' })); }}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${uploadMode === 'file' ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600'}`}>
              📁 Depuis mon appareil (PC / Téléphone)
            </button>
            <button type="button" onClick={() => { setUploadMode('url'); setPreview(null); setForm(prev => ({ ...prev, base64Data: '', fileName: '' })); }}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${uploadMode === 'url' ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600'}`}>
              🔗 Depuis une URL
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">Sélectionner une image ou vidéo</label>
              <div className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <div>
                    {form.type === 'photo' ? (
                      <img src={preview} alt="Aperçu" className="max-h-40 mx-auto rounded-lg object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🎥</span>
                        <p className="text-sm text-gray-600">{form.fileName}</p>
                      </div>
                    )}
                    <p className="text-xs text-primary-700 mt-2 font-medium">✅ Fichier sélectionné — cliquez pour changer</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl block mb-2">📸</span>
                    <p className="text-primary-700 font-semibold">Cliquez pour sélectionner</p>
                    <p className="text-gray-400 text-xs mt-1">Images : JPG, PNG, WebP — Vidéos : MP4, MOV (max 50MB)</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">URL de l'image ou vidéo</label>
              <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <p className="text-xs text-gray-400 mt-1">Lien direct vers une image (Google Drive public, Imgur, etc.)</p>
              {form.url && (
                <div className="mt-2">
                  <img src={form.url} alt="Aperçu URL" className="max-h-32 rounded-lg object-contain"
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
          )}

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
                placeholder="Ex: Mariage Hilton 2024"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Envoi en cours...' : '+ Ajouter à ma galerie'}
          </button>
        </form>
      )}

      {gallery.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">📸</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Galerie vide</h2>
          <p className="text-gray-500 mb-4">Ajoutez des photos et vidéos de vos réalisations.</p>
          <button onClick={() => setShowForm(true)} className="bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-colors">
            Ajouter ma première photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map(item => (
            <div key={item.id} className="rounded-2xl overflow-hidden aspect-square bg-primary-100 relative group">
              {item.type === 'photo' ? (
                <img src={getImageSrc(item.url)} alt={item.description || 'Réalisation'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-primary-900 text-white">
                  <span className="text-4xl">🎥</span>
                  {item.description && <p className="text-xs mt-2 text-center px-2">{item.description}</p>}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {item.description && <p className="text-white text-xs text-center">{item.description}</p>}
                <button onClick={() => handleDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}

export default ProviderGallery;