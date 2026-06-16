import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [userSettings, setUserSettings] = useState({ langue: 'fr', theme: 'light', notif_email: true });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, uRes, lRes] = await Promise.all([
          api.get('/settings'),
          api.get('/user-settings'),
          api.get('/admin/logs'),
        ]);
        setSiteSettings(sRes.data);
        setUserSettings(uRes.data);
        setLogs(Array.isArray(lRes.data) ? lRes.data : []);
      } catch {}
    };
    fetchData();
  }, []);

  const handleSaveSiteSettings = async () => {
    setLoading(true); setMessage('');
    try {
      await Promise.all(Object.entries(siteSettings).map(([cle, valeur]) => api.put('/settings', { cle, valeur })));
      setMessage('Paramètres du site sauvegardés !');
    } catch { setMessage('Erreur'); }
    finally { setLoading(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleSaveUserSettings = async () => {
    setLoading(true); setMessage('');
    try {
      await api.put('/user-settings', userSettings);
      setMessage('Préférences sauvegardées !');
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

  const siteFields = [
    { key: 'site_nom', label: 'Nom du site' },
    { key: 'site_slogan', label: 'Slogan' },
    { key: 'site_email', label: 'Email de contact' },
    { key: 'site_telephone', label: 'Téléphone' },
    { key: 'site_adresse', label: 'Adresse' },
    { key: 'facebook', label: 'Facebook URL' },
    { key: 'instagram', label: 'Instagram URL' },
    { key: 'whatsapp', label: 'WhatsApp' },
  ];

  const tabs = [
    { id: 'site', label: '🌐 Site' },
    { id: 'compte', label: '👤 Mon compte' },
    { id: 'securite', label: '🔒 Sécurité' },
    { id: 'preferences', label: '⚙️ Préférences' },
    { id: 'logs', label: '📋 Journaux' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Configuration du site et de votre compte administrateur</p>
      </div>

      {message && <p className={`p-3 rounded-lg mb-4 text-sm ${message.includes('!') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>{message}</p>}

      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-accent-500 text-primary-950' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 max-w-2xl">
        {activeTab === 'site' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Paramètres généraux du site</h2>
            {siteFields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-primary-900 mb-1">{f.label}</label>
                <input value={siteSettings[f.key] || ''} onChange={e => setSiteSettings({...siteSettings, [f.key]: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
            <button onClick={handleSaveSiteSettings} disabled={loading}
              className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Sauvegarde...' : '💾 Sauvegarder les paramètres du site'}
            </button>
          </div>
        )}

        {activeTab === 'compte' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Mon compte administrateur</h2>
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl mb-2">
              <div className="w-14 h-14 rounded-full bg-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                {user?.first_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-heading font-bold text-primary-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <span className="text-xs bg-accent-500 text-primary-950 font-bold px-3 py-0.5 rounded-full">Administrateur</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Email (non modifiable)</label>
              <input value={user?.email} disabled className="w-full border border-gray-100 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
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
              <label className="block text-sm font-medium text-primary-900 mb-1">Confirmer</label>
              <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button onClick={handleChangePassword} disabled={loading}
              className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Modification...' : '🔒 Changer le mot de passe'}
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-primary-900">Préférences</h2>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Langue</label>
              <select value={userSettings.langue} onChange={e => setUserSettings({...userSettings, langue: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">Thème</label>
              <div className="flex gap-3">
                {['light', 'dark'].map(t => (
                  <button key={t} onClick={() => setUserSettings({...userSettings, theme: t})}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${userSettings.theme === t ? 'border-accent-500 bg-accent-500/10 text-accent-600' : 'border-gray-200 text-gray-600'}`}>
                    {t === 'light' ? '☀️ Clair' : '🌙 Sombre'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-primary-900">Notifications par email</p>
                <p className="text-gray-500 text-sm">Alertes système, nouveaux paiements</p>
              </div>
              <button onClick={() => setUserSettings({...userSettings, notif_email: !userSettings.notif_email})}
                className={`relative w-12 h-6 rounded-full transition-colors ${userSettings.notif_email ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${userSettings.notif_email ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <button onClick={handleSaveUserSettings} disabled={loading}
              className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 className="font-heading font-bold text-primary-900 mb-4">Journaux d'activité</h2>
            {logs.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun journal disponible.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg text-xs">
                    <span className="text-gray-400 shrink-0">{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                    <span className="text-primary-700 font-semibold shrink-0">{log.action}</span>
                    <span className="text-gray-600">{log.details || '-'}</span>
                    {log.first_name && <span className="text-gray-400 shrink-0 ml-auto">{log.first_name}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;