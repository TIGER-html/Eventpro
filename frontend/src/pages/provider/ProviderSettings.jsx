import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderSettings() {
  const [settings, setSettings] = useState({ langue: 'fr', theme: 'light', notif_email: true, notif_sms: false, disponible: true });
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('compte');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/user-settings');
        setSettings(res.data);
      } catch {}
    };
    setProfile({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true); setMessage('');
    try {
      await api.put('/user-settings', settings);
      setMessage('Paramètres sauvegardés !');
    } catch { setMessage('Erreur lors de la sauvegarde'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleSaveProfile = async () => {
    setLoading(true); setMessage('');
    try {
      const res = await api.put('/user-settings/profile', profile);
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
      setMessage('Profil mis à jour !');
    } catch { setMessage('Erreur'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) { setMessage('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setMessage('');
    try {
      await api.put('/user-settings/password', passwordForm);
      setMessage('Mot de passe modifié !');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) { setMessage(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const tabs = [
    { id: 'compte', label: '👤 Compte' },
    { id: 'disponibilite', label: '📅 Disponibilité' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'securite', label: '🔒 Sécurité' },
    { id: 'preferences', label: '⚙️ Préférences' },
  ];

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 max-w-2xl">
        {activeTab === 'compte' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-1">Prénom</label>
                <input value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-1">Nom</label>
                <input value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Téléphone</label>
              <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Email (non modifiable)</label>
              <input value={user?.email} disabled className="w-full border border-gray-100 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
            <button onClick={handleSaveProfile} disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        )}

        {activeTab === 'disponibilite' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Disponibilité</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-primary-900">Je suis disponible pour de nouvelles missions</p>
                <p className="text-gray-500 text-sm mt-1">Activez/désactivez votre disponibilité dans le catalogue</p>
              </div>
              <button onClick={() => setSettings({...settings, disponible: !settings.disponible})}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.disponible ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.disponible ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className={`p-4 rounded-xl ${settings.disponible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-medium ${settings.disponible ? 'text-green-700' : 'text-red-600'}`}>
                {settings.disponible ? '✅ Vous apparaissez comme disponible dans le catalogue' : '❌ Vous êtes marqué comme indisponible'}
              </p>
            </div>
            <button onClick={handleSaveSettings} disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Préférences de notifications</h2>
            {[
              { key: 'notif_email', label: 'Notifications par email', desc: 'Nouvelles demandes de devis, mises à jour de missions' },
              { key: 'notif_sms', label: 'Notifications par SMS', desc: 'Alertes urgentes uniquement' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-primary-900">{n.label}</p>
                  <p className="text-gray-500 text-sm">{n.desc}</p>
                </div>
                <button onClick={() => setSettings({...settings, [n.key]: !settings[n.key]})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings[n.key] ? 'bg-primary-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[n.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
            <button onClick={handleSaveSettings} disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        )}

        {activeTab === 'securite' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Sécurité</h2>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Mot de passe actuel</label>
              <input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Nouveau mot de passe</label>
              <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Confirmer le nouveau mot de passe</label>
              <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button onClick={handleChangePassword} disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Modification...' : '🔒 Changer le mot de passe'}
            </button>
            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="font-semibold text-red-600 mb-2">Zone dangereuse</h3>
              <p className="text-sm text-gray-500 mb-3">La suppression de votre compte est irréversible.</p>
              <button onClick={() => { if(window.confirm('Êtes-vous sûr ? Cette action est irréversible.')) api.delete('/user-settings/account').then(() => { localStorage.clear(); window.location.href = '/'; }); }}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 px-4 rounded-xl border border-red-200 transition-colors text-sm">
                🗑️ Supprimer mon compte
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Préférences</h2>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Langue</label>
              <select value={settings.langue} onChange={e => setSettings({...settings, langue: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">Thème</label>
              <div className="flex gap-3">
                <button onClick={() => setSettings({...settings, theme: 'light'})}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${settings.theme === 'light' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                  ☀️ Clair
                </button>
                <button onClick={() => setSettings({...settings, theme: 'dark'})}
                  className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${settings.theme === 'dark' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}>
                  🌙 Sombre
                </button>
              </div>
            </div>
            <button onClick={handleSaveSettings} disabled={loading} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : 'Sauvegarder les préférences'}
            </button>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}

export default ProviderSettings;