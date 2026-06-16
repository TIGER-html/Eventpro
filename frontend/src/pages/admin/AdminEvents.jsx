import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/admin/events');
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {}
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const typeIcons = { mariage: '💍', anniversaire: '🎂', conference: '🎤', seminaire: '📊', gala: '🥂', autre: '✨' };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion des événements</h1>
        <p className="text-gray-500 mt-1">{events.length} événement(s) au total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 p-4">
        <input placeholder="🔍 Rechercher un événement..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left font-medium text-gray-500">Événement</th>
              <th className="p-4 text-left font-medium text-gray-500">Client</th>
              <th className="p-4 text-left font-medium text-gray-500">Date</th>
              <th className="p-4 text-left font-medium text-gray-500">Budget</th>
              <th className="p-4 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[e.type] || '✨'}</span>
                    <div>
                      <p className="font-medium text-primary-900">{e.name}</p>
                      <p className="text-gray-400 text-xs capitalize">{e.type} • {e.location || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-gray-600">{e.first_name} {e.last_name}</p>
                  <p className="text-gray-400 text-xs">{e.email}</p>
                </td>
                <td className="p-4 text-gray-600">{new Date(e.event_date).toLocaleDateString('fr-FR')}</td>
                <td className="p-4 font-semibold text-primary-700">{Number(e.max_budget).toLocaleString('fr-FR')} FCFA</td>
                <td className="p-4">
                  <Link to={`/events/${e.id}`} className="text-primary-700 hover:underline text-xs font-medium">Voir détails</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminEvents;