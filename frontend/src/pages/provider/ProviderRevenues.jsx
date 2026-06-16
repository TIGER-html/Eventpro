import { useEffect, useState } from 'react';
import ProviderLayout from '../../components/ProviderLayout';
import api from '../../services/api';

function ProviderRevenues() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/provider-ext/revenues');
        setData(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <ProviderLayout><p className="text-gray-400">Chargement...</p></ProviderLayout>;

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Mes revenus</h1>
        <p className="text-gray-500 mt-1">Suivi de vos gains et commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary-50 rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revenus bruts</p>
          <p className="text-2xl font-bold text-primary-900">{Number(data?.total_brut || 0).toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Commission plateforme ({data?.taux_commission}%)</p>
          <p className="text-2xl font-bold text-red-600">- {Number(data?.commission || 0).toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revenus nets</p>
          <p className="text-2xl font-bold text-green-700">{Number(data?.total_net || 0).toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">📅 Revenus mensuels</h2>
          {data?.mensuel?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.mensuel.map((m, i) => {
                const max = Math.max(...data.mensuel.map(x => parseFloat(x.total)));
                const pct = max > 0 ? (parseFloat(m.total) / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{m.mois}</span>
                      <span className="font-semibold text-green-700">{Number(m.total).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée mensuelle</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">💰 Missions payées</h2>
          {data?.missions_payees?.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {data.missions_payees.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">🎉</span>
                  <div className="flex-1">
                    <p className="font-semibold text-primary-900 text-sm">{m.event_name}</p>
                    <p className="text-gray-400 text-xs">{new Date(m.event_date).toLocaleDateString('fr-FR')} • {m.first_name} {m.last_name}</p>
                  </div>
                  <p className="font-bold text-green-700 text-sm shrink-0">{Number(m.agreed_price || 0).toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune mission payée pour le moment.</p>}
        </div>
      </div>
    </ProviderLayout>
  );
}

export default ProviderRevenues;