import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientServices() {
  const [services, setServices] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [devis, setDevis] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tous');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, eRes] = await Promise.all([api.get('/services'), api.get('/events')]);
        setServices(Array.isArray(sRes.data) ? sRes.data : []);
        setEvents(Array.isArray(eRes.data) ? eRes.data : []);
      } catch {}
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchDevis();
  }, [selectedEvent]);

  const fetchDevis = async () => {
    try {
      const res = await api.get(`/services/event/${selectedEvent}/devis`);
      setDevis(res.data);
    } catch {}
  };

  const handleAddService = async (serviceId) => {
    if (!selectedEvent) { setMessage('Sélectionnez d\'abord un événement.'); return; }
    setLoading(true);
    try {
      await api.post('/services/event/add', { event_id: selectedEvent, service_id: serviceId, quantite: 1 });
      setMessage('Service ajouté à votre événement !');
      fetchDevis();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const categories = ['Tous', ...new Set(services.map(s => s.categorie))];
  const filteredServices = activeCategory === 'Tous' ? services : services.filter(s => s.categorie === activeCategory);

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Services</h1>
        <p className="text-gray-500 mt-1">Choisissez vos services et obtenez un devis instantané</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-4 mb-6">
        <label className="block text-sm font-medium text-primary-900 mb-2">Pour quel événement ?</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="">-- Sélectionnez un événement --</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{message}</p>}

      {devis && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-6">
          <h2 className="font-heading font-bold text-primary-900 mb-3">📋 Devis automatique</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-500">Sous-total</p>
              <p className="font-bold text-primary-900">{Number(devis.sous_total).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-500">Taxes (19.25%)</p>
              <p className="font-bold text-primary-900">{Number(devis.taxes).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-500">Total TTC</p>
              <p className="font-bold text-primary-700 text-lg">{Number(devis.total).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className={`rounded-xl p-3 ${devis.dans_budget ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-500">Budget</p>
              <p className={`font-bold ${devis.dans_budget ? 'text-green-700' : 'text-red-600'}`}>
                {devis.dans_budget ? '✅ Dans le budget' : '⚠️ Dépassement'}
              </p>
            </div>
          </div>
          {devis.services.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-primary-900 text-sm mb-2">Services sélectionnés :</p>
              <div className="flex flex-col gap-2">
                {devis.services.map(s => (
                  <div key={s.id} className="bg-white rounded-lg p-3 flex justify-between items-center text-sm">
                    <span className="text-primary-900 font-medium">{s.nom} × {s.quantite}</span>
                    <span className="text-primary-700 font-semibold">{Number(s.prix_total).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white rounded-2xl shadow-card border border-gray-100 hover:border-primary-200 transition-all p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{service.categorie}</span>
              <span className="font-bold text-primary-700">{Number(service.prix).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <h3 className="font-heading font-bold text-primary-900 mt-2">{service.nom}</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">{service.description}</p>
            <button onClick={() => handleAddService(service.id)} disabled={loading}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
              + Ajouter à mon événement
            </button>
          </div>
        ))}
      </div>
    </ClientLayout>
  );
}

export default ClientServices;