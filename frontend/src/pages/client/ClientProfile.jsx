import { useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

function ClientProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      const updatedUser = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profil mis à jour avec succès !');
    } catch (err) {
      setMessage('Erreur lors de la mise à jour');
    } finally { setLoading(false); }
  };

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Mon profil</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center text-white text-2xl font-bold">
              {user?.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-primary-900">{user?.first_name} {user?.last_name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="text-xs bg-primary-50 text-primary-700 font-semibold px-3 py-1 rounded-full capitalize">{user?.role}</span>
            </div>
          </div>

          {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-1">Prénom</label>
                <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-1">Nom</label>
                <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Téléphone</label>
              <input placeholder="6XX XXX XXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Email</label>
              <input value={user?.email} disabled className="w-full border border-gray-100 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>

            <button type="submit" disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors disabled:opacity-60">
              {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}

export default ClientProfile;