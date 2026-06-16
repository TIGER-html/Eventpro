import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'prestataire') navigate('/provider/dashboard');
      else navigate('/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-400/10 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-8 border border-primary-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-700 text-white text-2xl mb-3">🎉</div>
          <h2 className="font-heading text-2xl font-bold text-primary-900">Connexion</h2>
          <p className="text-sm text-gray-500 mt-1">Accédez à votre espace EventPro</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Email</label>
            <input name="email" type="email" placeholder="vous@exemple.com" value={form.email} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1">Mot de passe</label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-700 text-sm">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-lg shadow-md transition-colors disabled:opacity-60">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary-700 font-semibold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;