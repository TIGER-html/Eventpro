import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientMessages() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch {}
  };

  const unread = notifications.filter(n => !n.lu).length;

  return (
    <ClientLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-900">Messages & Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{unread} non lue(s)</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="text-primary-700 text-sm font-medium hover:underline">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">🔔</span>
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-2">Aucune notification</h2>
          <p className="text-gray-500">Vos notifications apparaîtront ici.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(n => (
            <div key={n.id} className={`bg-white rounded-2xl shadow-card border p-5 flex gap-4 items-start transition-colors ${!n.lu ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${!n.lu ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                🔔
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary-900">{n.titre}</p>
                <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                <p className="text-gray-400 text-xs mt-2">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
              </div>
              {!n.lu && (
                <button onClick={() => handleMarkRead(n.id)} className="text-primary-700 text-xs font-medium hover:underline shrink-0">
                  Marquer lu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}

export default ClientMessages;