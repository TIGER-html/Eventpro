import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/admin/all');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/reviews/${id}/approve`);
      setMessage('Avis approuvé !');
      fetchReviews();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch {}
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion des avis</h1>
        <p className="text-gray-500 mt-1">{reviews.length} avis au total</p>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">⭐</span>
          <p className="text-gray-500">Aucun avis pour le moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl shadow-card border p-5 ${!r.approuve ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex gap-1 mb-1">
                    {[...Array(r.note)].map((_, i) => <span key={i} className="text-accent-500">⭐</span>)}
                    {[...Array(5 - r.note)].map((_, i) => <span key={i} className="text-gray-200">⭐</span>)}
                  </div>
                  <p className="text-gray-700 text-sm mt-1 italic">"{r.commentaire}"</p>
                  <p className="font-semibold text-primary-900 text-sm mt-2">{r.first_name} {r.last_name}</p>
                  {r.event_name && <p className="text-gray-400 text-xs">{r.event_name}</p>}
                  <p className="text-gray-400 text-xs mt-1">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.approuve ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {r.approuve ? '✅ Approuvé' : '⏳ En attente'}
                  </span>
                  <div className="flex gap-2">
                    {!r.approuve && (
                      <button onClick={() => handleApprove(r.id)} className="text-green-600 hover:text-green-700 text-xs font-semibold">Approuver</button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminReviews;