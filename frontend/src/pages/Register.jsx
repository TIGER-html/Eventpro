import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PhoneInput, { COUNTRIES } from '../components/PhoneInput';
import CitySelect from '../components/CitySelect';

function Register() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', phone: '', role: 'client', ville: ''
  });
  const [indicatif, setIndicatif] = useState('+237');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoneChange = (fullPhone) => {
    const country = COUNTRIES.find(c => fullPhone.startsWith(c.code));
    if (country) setIndicatif(country.code);
    setForm(prev => ({ ...prev, phone: fullPhone }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    if (!form.phone) { setError('Veuillez entrer un numéro de téléphone valide.'); setLoading(false); return; }
    try {
      await api.post('/auth/register', form);
      setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-400/10 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-lg p-8 border border-primary-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-700 text-white text-2xl mb-3">🎉</div>
          <h2 className="font-heading text-2xl font-bold text-primary-900">Créer un compte</h2>
          <p className="text-sm text-gray-500 mt-1">Rejoignez EventPro Cameroun</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        {success && <p className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg mb-4 text-sm">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Prénom</label>
              <input name="first_name" placeholder="Marie" value={form.first_name} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">Nom</label>
              <input name="last_name" placeholder="Nguemo" value={form.last_name} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Email</label>
            <input name="email" type="email" placeholder="vous@exemple.com" value={form.email} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Téléphone</label>
            <PhoneInput value={form.phone} onChange={handlePhoneChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Ville</label>
            <CitySelect indicatif={indicatif} value={form.ville} onChange={v => setForm(prev => ({ ...prev, ville: v }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Mot de passe</label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-700 text-sm">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Vous êtes</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="client">🎉 Client (j'organise un événement)</option>
              <option value="prestataire">🛎️ Prestataire de service</option>
              <option value="organisateur">📋 Organisateur / Agence</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-60 mt-2">
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-700 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;