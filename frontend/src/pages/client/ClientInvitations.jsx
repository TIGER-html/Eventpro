import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientInvitations() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {}
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchGuests();
  }, [selectedEvent]);

  const fetchGuests = async () => {
    try {
      const res = await api.get(`/guests/event/${selectedEvent}`);
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/guests', { event_id: selectedEvent, ...form });
      setForm({ name: '', email: '', phone: '' });
      setMessage('Invité ajouté avec succès !');
      fetchGuests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  const handleRsvpChange = async (guestId, status) => {
    try {
      await api.put(`/guests/${guestId}/rsvp`, { rsvp_status: status });
      fetchGuests();
    } catch {}
  };

  const handleDelete = async (guestId) => {
    try {
      await api.delete(`/guests/${guestId}`);
      fetchGuests();
    } catch {}
  };

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const declined = guests.filter(g => g.rsvp_status === 'declined').length;
  const pending = guests.filter(g => g.rsvp_status === 'pending').length;

  const rsvpBadge = (status) => ({
    confirmed: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
  }[status] || 'bg-gray-100 text-gray-600');

  const selectedEventData = events.find(e => String(e.id) === String(selectedEvent));

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Invitations</h1>
        <p className="text-gray-500 mt-1">Gérez vos invités et suivez les confirmations RSVP</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-4 mb-6">
        <label className="block text-sm font-medium text-primary-900 mb-2">Sélectionner un événement</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="">-- Choisissez un événement --</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {selectedEvent && (
        <>
          {selectedEventData && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-4">
              <p className="text-sm font-medium text-primary-900 mb-1">📤 Lien de partage (RSVP en ligne)</p>
              <a href={`/public/event/${selectedEvent}`} target="_blank" rel="noopener noreferrer"
                className="text-primary-700 font-semibold underline text-sm break-all">
                {window.location.origin}/public/event/{selectedEvent}
              </a>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{confirmed}</p>
              <p className="text-xs text-gray-500 mt-1">Confirmés</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{declined}</p>
              <p className="text-xs text-gray-500 mt-1">Déclinés</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{pending}</p>
              <p className="text-xs text-gray-500 mt-1">En attente</p>
            </div>
          </div>

          {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

          <form onSubmit={handleAddGuest} className="bg-white rounded-2xl shadow-card border border-primary-100 p-5 mb-6 flex flex-wrap gap-3">
            <input placeholder="Nom de l'invité" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" required />
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            <input placeholder="Téléphone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              + Ajouter
            </button>
          </form>

          {guests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun invité pour le moment.</p>
          ) : (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-left font-medium text-gray-500">Nom</th>
                    <th className="p-4 text-left font-medium text-gray-500">Contact</th>
                    <th className="p-4 text-left font-medium text-gray-500">RSVP</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map(g => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-medium text-primary-900">{g.name}</td>
                      <td className="p-4 text-gray-500">{g.email || g.phone || '-'}</td>
                      <td className="p-4">
                        <select value={g.rsvp_status} onChange={e => handleRsvpChange(g.id, e.target.value)}
                          className={`border-0 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${rsvpBadge(g.rsvp_status)}`}>
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="declined">Décliné</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ClientLayout>
  );
}

export default ClientInvitations;