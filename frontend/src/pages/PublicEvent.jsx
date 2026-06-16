import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function PublicEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState('');
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const eventRes = await api.get(`/events/${id}`);
      setEvent(eventRes.data);

      const guestsRes = await api.get(`/guests/event/${id}`);
      setGuests(Array.isArray(guestsRes.data) ? guestsRes.data : []);
    } catch (err) {
      setError('Événement non trouvé');
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRsvp = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const guest = guests.find(g => g.name.toLowerCase() === rsvpName.toLowerCase());

    if (!guest) {
      setMessage("Nom non trouvé dans la liste des invités. Vérifiez l'orthographe.");
      setLoading(false);
      return;
    }

    try {
      await api.put(`/guests/${guest.id}/rsvp`, { rsvp_status: rsvpStatus });
      setMessage('Merci ! Votre réponse a été enregistrée. 🎉');
      fetchEvent();
    } catch (err) {
      setMessage("Erreur lors de l'enregistrement de votre réponse.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card border border-red-100 p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
        style={{ borderTop: `8px solid ${event.theme_color || '#7c3aed'}` }}
      >
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="font-heading text-3xl font-bold text-primary-900 mb-2">{event.name}</h1>
        <p className="text-gray-500 capitalize mb-1">{event.type}</p>
        <p className="text-gray-600 mb-1">
          📅 {new Date(event.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-gray-600 mb-6">📍 {event.location || 'Lieu à confirmer'}</p>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="font-heading text-lg font-bold text-primary-900 mb-3">Confirmez votre présence</h2>

          {message && (
            <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('Merci') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleRsvp} className="flex flex-col gap-3">
            <input
              placeholder="Votre nom complet"
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-center"
              required
            />
            <select
              value={rsvpStatus}
              onChange={(e) => setRsvpStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-center bg-white"
              required
            >
              <option value="">-- Votre réponse --</option>
              <option value="confirmed">✅ Je viens</option>
              <option value="declined">❌ Je ne viens pas</option>
              <option value="pending">🤔 Je ne sais pas encore</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-60"
            >
              {loading ? 'Envoi...' : 'Envoyer ma réponse'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicEvent;