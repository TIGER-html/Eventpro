import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../services/api';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState('');
  const [importMessage, setImportMessage] = useState('');

  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '' });
  const [expenseForm, setExpenseForm] = useState({ category: '', label: '', amount: '' });

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchAll = async () => {
    try {
      const eventRes = await api.get(`/events/${id}`);
      setEvent(eventRes.data);

      const guestsRes = await api.get(`/guests/event/${id}`);
      setGuests(Array.isArray(guestsRes.data) ? guestsRes.data : []);

      const providersRes = await api.get(`/providers/event/${id}`);
      setProviders(Array.isArray(providersRes.data) ? providersRes.data : []);

      const allProvidersRes = await api.get(`/providers`);
      setAllProviders(Array.isArray(allProvidersRes.data) ? allProvidersRes.data : []);

      const budgetRes = await api.get(`/budget/event/${id}/summary`);
      setBudget(budgetRes.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/guests', { event_id: id, ...guestForm });
      setGuestForm({ name: '', email: '', phone: '' });
      fetchAll();
    } catch (err) {
      setError("Erreur lors de l'ajout de l'invité");
    }
  };

  const handleRsvpChange = async (guestId, status) => {
    try {
      await api.put(`/guests/${guestId}/rsvp`, { rsvp_status: status });
      fetchAll();
    } catch (err) {
      setError('Erreur lors de la mise à jour RSVP');
    }
  };

  const handleDeleteGuest = async (guestId) => {
    try {
      await api.delete(`/guests/${guestId}`);
      fetchAll();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleRequestProvider = async (providerId) => {
    try {
      await api.post('/providers/request', { event_id: id, provider_id: providerId });
      fetchAll();
    } catch (err) {
      setError('Erreur lors de la demande de prestataire');
    }
  };

  const handleProviderStatus = async (requestId, status) => {
    try {
      await api.put(`/providers/${requestId}/status`, { status });
      fetchAll();
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budget', { event_id: id, ...expenseForm });
      setExpenseForm({ category: '', label: '', amount: '' });
      fetchAll();
    } catch (err) {
      setError("Erreur lors de l'ajout de la dépense");
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const guestsToImport = rows.map(row => ({
          name: row.Nom || row.nom || row.name || row.Name || '',
          email: row.Email || row.email || '',
          phone: row.Téléphone || row.telephone || row.phone || row.Phone || ''
        })).filter(g => g.name);

        if (guestsToImport.length === 0) {
          setImportMessage('Aucune ligne valide trouvée. Vérifiez que votre fichier a une colonne "Nom".');
          return;
        }

        await api.post('/guests/import', { event_id: id, guests: guestsToImport });
        setImportMessage(`${guestsToImport.length} invité(s) importé(s) avec succès !`);
        fetchAll();
      } catch (err) {
        setImportMessage('Erreur lors de la lecture du fichier Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const openChat = async (eventProviderId) => {
    setActiveChat(eventProviderId);
    try {
      const res = await api.get(`/messages/${eventProviderId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/messages', { event_provider_id: activeChat, content: newMessage });
      setNewMessage('');
      const res = await api.get(`/messages/${activeChat}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
    }
  };

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'declined').length;
  const pendingCount = guests.filter(g => g.rsvp_status === 'pending').length;

  const rsvpBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700',
    };
    return styles[status] || styles.pending;
  };

  const statusLabel = {
    pending: 'En attente',
    accepted: 'Accepté',
    paid: 'Payé',
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-primary-50 via-white to-accent-400/5 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {error && (
          <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm">{error}</p>
        )}

        {/* En-tête événement */}
        <div
          className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6"
          style={{ borderTopColor: event.theme_color || '#7c3aed', borderTopWidth: '6px' }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-primary-900">{event.name}</h1>
              <p className="text-gray-500 mt-1 capitalize">{event.type}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>📅 {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>📍 {event.location || 'Non précisé'}</span>
              </div>
            </div>
            <Link
              to={`/events/${id}/report`}
              className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md transition-colors text-center whitespace-nowrap"
            >
              📊 Voir le bilan complet
            </Link>
          </div>

          <div className="mt-4 bg-primary-50 border border-primary-100 p-4 rounded-xl">
            <p className="text-sm text-primary-900 font-medium mb-1">📤 Lien à partager avec vos invités</p>
            <p className="text-xs text-gray-500 mb-2">WhatsApp, Facebook, SMS — les invités confirment leur présence sans créer de compte</p>
           <a> 
              href={`/public/event/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 font-semibold underline break-all text-sm hover:text-primary-800"
            
              {window.location.origin}/public/event/{event.id}
            </a>
          </div>
        </div>

        {/* Budget */}
        {budget && (
          <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6">
            <h2 className="font-heading text-xl font-bold text-primary-900 mb-4">💰 Suivi du budget</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-primary-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Budget prévu</p>
                <p className="text-lg font-bold text-primary-900 mt-1">{Number(budget.max_budget).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dépensé</p>
                <p className="text-lg font-bold text-blue-700 mt-1">{Number(budget.total_spent).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${budget.is_over_budget ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Restant</p>
                <p className={`text-lg font-bold mt-1 ${budget.is_over_budget ? 'text-red-600' : 'text-green-700'}`}>
                  {Number(budget.remaining).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            {budget.alert && (
              <p className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg mb-4 text-sm font-semibold">
                {budget.alert}
              </p>
            )}

            {budget.by_category.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-primary-900 mb-2 text-sm">Dépenses par catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {budget.by_category.map((cat, i) => (
                    <span key={i} className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full font-medium">
                      {cat.category} : {Number(cat.total).toLocaleString('fr-FR')} FCFA
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddExpense} className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
              <input
                placeholder="Catégorie (ex: Traiteur)"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                required
              />
              <input
                placeholder="Libellé"
                value={expenseForm.label}
                onChange={(e) => setExpenseForm({ ...expenseForm, label: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <input
                type="number"
                placeholder="Montant (FCFA)"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                required
              />
              <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                Ajouter
              </button>
            </form>
          </div>
        )}

        {/* Invités */}
        <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6">
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-4">
            👥 Invités
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({confirmedCount} confirmés · {declinedCount} déclinés · {pendingCount} en attente)
            </span>
          </h2>

          <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl mb-4">
            <label className="block text-sm font-semibold text-primary-900 mb-1">📥 Importer une liste depuis Excel</label>
            <p className="text-xs text-gray-500 mb-2">Le fichier doit contenir des colonnes : Nom, Email, Téléphone</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileImport}
              className="text-sm"
            />
            {importMessage && <p className="text-sm mt-2 text-primary-700 font-semibold">{importMessage}</p>}
          </div>

          <form onSubmit={handleAddGuest} className="flex gap-2 flex-wrap mb-4">
            <input
              placeholder="Nom de l'invité"
              value={guestForm.name}
              onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              required
            />
            <input
              placeholder="Email"
              value={guestForm.email}
              onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <input
              placeholder="Téléphone"
              value={guestForm.phone}
              onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Ajouter
            </button>
          </form>

          {guests.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun invité pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-2 font-medium">Nom</th>
                    <th className="p-2 font-medium">Contact</th>
                    <th className="p-2 font-medium">Statut RSVP</th>
                    <th className="p-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => (
                    <tr key={g.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-primary-900">{g.name}</td>
                      <td className="p-2 text-gray-500">{g.email || g.phone || '-'}</td>
                      <td className="p-2">
                        <select
                          value={g.rsvp_status}
                          onChange={(e) => handleRsvpChange(g.id, e.target.value)}
                          className={`border-0 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${rsvpBadge(g.rsvp_status)}`}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="declined">Décliné</option>
                        </select>
                      </td>
                      <td className="p-2 text-right">
                        <button onClick={() => handleDeleteGuest(g.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Prestataires + messagerie */}
        <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6">
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-4">🛎️ Prestataires</h2>

          <h3 className="font-semibold text-primary-900 mb-2 text-sm">Mes demandes / contrats</h3>
          {providers.length === 0 ? (
            <p className="text-gray-400 text-sm mb-4">Aucun prestataire sélectionné pour le moment.</p>
          ) : (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-2 font-medium">Service</th>
                    <th className="p-2 font-medium">Prix</th>
                    <th className="p-2 font-medium">Statut</th>
                    <th className="p-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-primary-900">{p.service_type}</td>
                      <td className="p-2 text-gray-500">{Number(p.agreed_price || p.price).toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-2">
                        <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                          {statusLabel[p.status] || p.status}
                        </span>
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        {p.status === 'pending' && (
                          <button onClick={() => handleProviderStatus(p.id, 'accepted')} className="text-green-600 hover:text-green-700 text-xs font-medium mr-3">
                            Accepter
                          </button>
                        )}
                        {p.status === 'accepted' && (
                          <button onClick={() => handleProviderStatus(p.id, 'paid')} className="text-blue-600 hover:text-blue-700 text-xs font-medium mr-3">
                            Marquer payé
                          </button>
                        )}
                        <button onClick={() => openChat(p.id)} className="text-primary-700 hover:text-primary-800 text-xs font-medium">
                          💬 Discuter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeChat && (
            <div className="border border-primary-100 rounded-xl mb-4 overflow-hidden">
              <div className="bg-primary-700 text-white px-4 py-2.5 flex justify-between items-center">
                <span className="font-semibold text-sm">💬 Messagerie</span>
                <button onClick={() => setActiveChat(null)} className="text-white hover:text-primary-200 text-sm">✕</button>
              </div>
              <div className="p-3 max-h-60 overflow-y-auto flex flex-col gap-2 bg-primary-50">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-4">Aucun message. Écrivez le premier !</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] p-2.5 rounded-lg text-sm ${
                        m.sender_id === currentUser?.id
                          ? 'bg-primary-700 text-white self-end'
                          : 'bg-white border border-gray-100 self-start'
                      }`}
                    >
                      <p className="font-semibold text-xs mb-1 opacity-80">{m.first_name} {m.last_name}</p>
                      <p>{m.content}</p>
                      <p className="text-xs opacity-60 mt-1">{new Date(m.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 p-3 bg-white border-t border-gray-100">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="border border-gray-200 rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  Envoyer
                </button>
              </form>
            </div>
          )}

          <h3 className="font-semibold text-primary-900 mb-2 text-sm">Catalogue des prestataires disponibles</h3>
          {allProviders.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun prestataire enregistré sur la plateforme pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allProviders.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:border-primary-200 transition-colors">
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">{p.service_type}</p>
                    <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{Number(p.price).toLocaleString('fr-FR')} FCFA • ⭐ {p.rating}/5</p>
                  </div>
                  <button onClick={() => handleRequestProvider(p.id)} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap ml-3">
                    Demander un devis
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;