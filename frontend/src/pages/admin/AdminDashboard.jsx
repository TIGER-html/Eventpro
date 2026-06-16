import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <AdminLayout><p className="text-gray-400">Chargement...</p></AdminLayout>;

  const cards = [
    { icon: '👥', label: 'Total clients', value: stats?.total_clients || 0, color: 'bg-blue-50 text-blue-700', link: '/admin/users' },
    { icon: '🎉', label: 'Total événements', value: stats?.total_events || 0, color: 'bg-purple-50 text-purple-700', link: '/admin/events' },
    { icon: '💰', label: 'Revenus validés', value: `${Number(stats?.total_revenus || 0).toLocaleString('fr-FR')} FCFA`, color: 'bg-green-50 text-green-700', link: '/admin/payments' },
    { icon: '⏳', label: 'Paiements en attente', value: stats?.paiements_en_attente || 0, color: 'bg-amber-50 text-amber-700', link: '/admin/payments' },
    { icon: '⭐', label: 'Avis à valider', value: stats?.avis_en_attente || 0, color: 'bg-orange-50 text-orange-700', link: '/admin/reviews' },
  ];

  const quickLinks = [
    { icon: '🔍', label: 'Vérifications KYC', link: '/admin/kyc', desc: 'Valider les identités prestataires' },
    { icon: '⚖️', label: 'Litiges ouverts', link: '/admin/disputes', desc: 'Résoudre les conflits' },
    { icon: '💸', label: 'Remboursements', link: '/admin/refunds', desc: 'Traiter les demandes' },
    { icon: '📢', label: 'Notifier tous', link: '/admin/notify', desc: 'Envoyer une annonce globale' },
    { icon: '📊', label: 'Analytics avancé', link: '/admin/analytics', desc: 'Statistiques détaillées' },
    { icon: '💲', label: 'Commissions', link: '/admin/commissions', desc: 'Gérer les taux' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-900">Dashboard Administrateur</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme EventPro Cameroun</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card, i) => (
          <Link to={card.link} key={i} className={`${card.color} rounded-2xl p-5 text-center hover:opacity-90 transition-opacity`}>
            <span className="text-3xl block mb-2">{card.icon}</span>
            <p className="text-xl font-bold font-heading">{card.value}</p>
            <p className="text-xs font-medium mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">💰 Revenus par mois</h2>
          {stats?.revenus_par_mois?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.revenus_par_mois.map((r, i) => {
                const max = Math.max(...stats.revenus_par_mois.map(x => parseFloat(x.total)));
                const pct = max > 0 ? (parseFloat(r.total) / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{r.mois}</span>
                      <span className="font-semibold text-primary-700">{Number(r.total).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary-700 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée disponible</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-primary-900 mb-4">🎉 Événements par type</h2>
          {stats?.events_par_type?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.events_par_type.map((e, i) => {
                const max = Math.max(...stats.events_par_type.map(x => parseInt(x.count)));
                const pct = max > 0 ? (parseInt(e.count) / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{e.type}</span>
                      <span className="font-semibold text-primary-700">{e.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-400 text-sm">Aucune donnée disponible</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <h2 className="font-heading font-bold text-primary-900 mb-4">⚡ Accès rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map((q, i) => (
            <Link to={q.link} key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all">
              <span className="text-2xl">{q.icon}</span>
              <div>
                <p className="font-semibold text-primary-900 text-sm">{q.label}</p>
                <p className="text-gray-400 text-xs">{q.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;