import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin-ext/analytics');
        setData(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <AdminLayout><p className="text-gray-400">Chargement...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Analytics avancé</h1>
        <p className="text-gray-500 mt-1">Statistiques détaillées de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🛎️', label: 'Prestataires actifs', value: data?.prestataires_actifs || 0, color: 'bg-blue-50 text-blue-700' },
          { icon: '🔍', label: 'KYC en attente', value: data?.kyc_en_attente || 0, color: 'bg-amber-50 text-amber-700' },
          { icon: '⚖️', label: 'Litiges ouverts', value: data?.litiges_ouverts || 0, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-5 text-center`}>
            <span className="text-3xl block mb-2">{s.icon}</span>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">🏆 Top prestataires</h2>
          {data?.top_prestataires?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.top_prestataires.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-primary-900 text-sm">{p.first_name} {p.last_name}</p>
                    <p className="text-gray-400 text-xs">{p.service_type} • ⭐ {parseFloat(p.rating || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-700 text-sm">{Number(p.revenus || 0).toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-gray-400 text-xs">{p.missions} missions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">📍 Revenus par ville</h2>
          {data?.revenus_par_ville?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.revenus_par_ville.map((v, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b border-gray-50">
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">{v.ville}</p>
                    <p className="text-gray-400 text-xs">{v.events} événements</p>
                  </div>
                  <p className="font-bold text-primary-700 text-sm">{Number(v.budget_total || 0).toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">🛎️ Services les plus demandés</h2>
          {data?.top_services?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.top_services.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b border-gray-50">
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">{s.nom}</p>
                    <p className="text-gray-400 text-xs">{s.categorie}</p>
                  </div>
                  <span className="bg-primary-50 text-primary-700 font-bold text-xs px-3 py-1 rounded-full">{s.count} demandes</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">📈 Croissance mensuelle clients</h2>
          {data?.croissance_mensuelle?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.croissance_mensuelle.map((m, i) => {
                const max = Math.max(...data.croissance_mensuelle.map(x => parseInt(x.nouveaux_clients)));
                const pct = max > 0 ? (parseInt(m.nouveaux_clients) / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{m.mois}</span>
                      <span className="font-semibold text-green-700">+{m.nouveaux_clients} clients</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;