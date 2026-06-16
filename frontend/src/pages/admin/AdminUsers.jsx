import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      setMessage('Rôle mis à jour');
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const handleSuspend = async (id, suspendre) => {
    try {
      await api.put(`/admin-ext/users/${id}/suspend`, { suspendre });
      setMessage(suspendre ? 'Compte suspendu' : 'Compte réactivé');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch {}
  };

  const filtered = users.filter(u => {
    const matchSearch = u.first_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  const roleBadge = (role) => ({
    admin: 'bg-red-50 text-red-700',
    client: 'bg-blue-50 text-blue-700',
    organisateur: 'bg-purple-50 text-purple-700',
    prestataire: 'bg-green-50 text-green-700',
    suspendu: 'bg-gray-100 text-gray-500',
  }[role] || 'bg-gray-100 text-gray-600');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Gestion des utilisateurs</h1>
        <p className="text-gray-500 mt-1">{users.length} utilisateur(s) enregistré(s)</p>
      </div>

      {message && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{message}</p>}

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 p-4 flex flex-col md:flex-row gap-3">
        <input placeholder="🔍 Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm">
          <option value="all">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="prestataire">Prestataires</option>
          <option value="organisateur">Organisateurs</option>
          <option value="admin">Admins</option>
          <option value="suspendu">Suspendus</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left font-medium text-gray-500">Utilisateur</th>
              <th className="p-4 text-left font-medium text-gray-500">Contact</th>
              <th className="p-4 text-left font-medium text-gray-500">Rôle</th>
              <th className="p-4 text-left font-medium text-gray-500">Inscrit le</th>
              <th className="p-4 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {u.first_name?.[0]?.toUpperCase()}
                    </div>
                    <p className="font-medium text-primary-900">{u.first_name} {u.last_name}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-gray-600">{u.email}</p>
                  <p className="text-gray-400 text-xs">{u.phone || '-'}</p>
                </td>
                <td className="p-4">
                  <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                    className={`border-0 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${roleBadge(u.role)}`}>
                    <option value="client">Client</option>
                    <option value="organisateur">Organisateur</option>
                    <option value="prestataire">Prestataire</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">
                  {u.role !== 'admin' && (
                    <button onClick={() => handleSuspend(u.id, u.role !== 'suspendu')}
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${u.role === 'suspendu' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'} transition-colors`}>
                      {u.role === 'suspendu' ? '✅ Réactiver' : '🚫 Suspendre'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;