import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function EventReport() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const eventRes = await api.get(`/events/${id}`);
      setEvent(eventRes.data);

      const guestsRes = await api.get(`/guests/event/${id}`);
      setGuests(Array.isArray(guestsRes.data) ? guestsRes.data : []);

      const expensesRes = await api.get(`/budget/event/${id}`);
      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);

      const budgetRes = await api.get(`/budget/event/${id}/summary`);
      setBudget(budgetRes.data);

      const providersRes = await api.get(`/providers/event/${id}`);
      setProviders(Array.isArray(providersRes.data) ? providersRes.data : []);
    } catch (err) {
      setError('Erreur lors du chargement du bilan');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  if (!event || !budget) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'declined').length;
  const pendingCount = guests.filter(g => g.rsvp_status === 'pending').length;
  const participationRate = guests.length > 0 ? ((confirmedCount / guests.length) * 100).toFixed(1) : 0;

  const handleExportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Bilan de l'événement : ${event.name}`, 14, 18);

    doc.setFontSize(11);
    doc.text(`Type : ${event.type}`, 14, 28);
    doc.text(`Date : ${new Date(event.event_date).toLocaleDateString('fr-FR')}`, 14, 34);
    doc.text(`Lieu : ${event.location || 'Non précisé'}`, 14, 40);

    doc.setFontSize(14);
    doc.text('Participation', 14, 52);
    autoTable(doc, {
      startY: 56,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Invités au total', guests.length],
        ['Confirmés', confirmedCount],
        ['Déclinés', declinedCount],
        ['En attente', pendingCount],
        ['Taux de participation', `${participationRate}%`],
      ],
    });

    doc.setFontSize(14);
    doc.text('Bilan financier', 14, doc.lastAutoTable.finalY + 12);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Indicateur', 'Montant (FCFA)']],
      body: [
        ['Budget prévu', budget.max_budget],
        ['Total dépensé', budget.total_spent],
        ['Restant', budget.remaining],
      ],
    });

    if (expenses.length > 0) {
      doc.setFontSize(14);
      doc.text('Détail des dépenses', 14, doc.lastAutoTable.finalY + 12);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Catégorie', 'Libellé', 'Montant (FCFA)']],
        body: expenses.map(e => [e.category, e.label || '-', e.amount]),
      });
    }

    if (providers.length > 0) {
      doc.setFontSize(14);
      doc.text('Prestataires', 14, doc.lastAutoTable.finalY + 12);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Service', 'Prix (FCFA)', 'Statut']],
        body: providers.map(p => [p.service_type, p.agreed_price || p.price, p.status]),
      });
    }

    doc.save(`bilan-${event.name}.pdf`);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(expenses.map(e => ({
      Catégorie: e.category,
      Libellé: e.label || '-',
      'Montant (FCFA)': e.amount,
      Date: new Date(e.created_at).toLocaleDateString('fr-FR')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dépenses');

    const wsGuests = XLSX.utils.json_to_sheet(guests.map(g => ({
      Nom: g.name,
      Email: g.email || '-',
      Téléphone: g.phone || '-',
      Statut: g.rsvp_status,
      Table: g.table_number || '-'
    })));
    XLSX.utils.book_append_sheet(wb, wsGuests, 'Invités');

    XLSX.writeFile(wb, `bilan-${event.name}.xlsx`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-primary-50 via-white to-accent-400/5 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {error && (
          <p className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-4 text-sm">{error}</p>
        )}

        <div
          className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6"
          style={{ borderTopColor: event.theme_color || '#7c3aed', borderTopWidth: '6px' }}
        >
          <h1 className="font-heading text-2xl font-bold text-primary-900 mb-1">📊 Bilan de l'événement</h1>
          <h2 className="text-lg text-gray-700 font-medium">{event.name}</h2>
          <p className="text-gray-500 mt-1">
            {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • {event.location || 'Non précisé'}
          </p>
        </div>

        {/* Participation */}
        <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6">
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-4">👥 Rapport de participation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Invités total</p>
              <p className="text-xl font-bold text-primary-900 mt-1">{guests.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Confirmés</p>
              <p className="text-xl font-bold text-green-700 mt-1">{confirmedCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Déclinés</p>
              <p className="text-xl font-bold text-red-600 mt-1">{declinedCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Participation</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{participationRate}%</p>
            </div>
          </div>
        </div>

        {/* Bilan financier */}
        <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6">
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-4">💰 Bilan financier final</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-primary-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Budget prévu</p>
              <p className="text-lg font-bold text-primary-900 mt-1">{Number(budget.max_budget).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Dépensé</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{Number(budget.total_spent).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${budget.is_over_budget ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Restant</p>
              <p className={`text-lg font-bold mt-1 ${budget.is_over_budget ? 'text-red-600' : 'text-green-700'}`}>
                {Number(budget.remaining).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {expenses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-2 font-medium">Catégorie</th>
                    <th className="p-2 font-medium">Libellé</th>
                    <th className="p-2 font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-primary-900">{e.category}</td>
                      <td className="p-2 text-gray-500">{e.label || '-'}</td>
                      <td className="p-2 text-gray-700">{Number(e.amount).toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Prestataires */}
        <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 mb-6">
          <h2 className="font-heading text-xl font-bold text-primary-900 mb-4">⭐ Prestataires utilisés</h2>
          {providers.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun prestataire utilisé pour cet événement.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="p-2 font-medium">Service</th>
                    <th className="p-2 font-medium">Prix payé</th>
                    <th className="p-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="p-2 font-medium text-primary-900">{p.service_type}</td>
                      <td className="p-2 text-gray-500">{Number(p.agreed_price || p.price).toLocaleString('fr-FR')} FCFA</td>
                      <td className="p-2">
                        <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1 rounded-full">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Exports */}
        <div className="bg-white rounded-2xl shadow-card border border-primary-100 p-6 flex flex-wrap gap-3">
          <button onClick={handleExportPdf} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg shadow-md transition-colors">
            📄 Exporter le bilan en PDF
          </button>
          <button onClick={handleExportExcel} className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-semibold px-5 py-3 rounded-lg shadow-md transition-colors">
            📊 Exporter en Excel
          </button>
          <Link to={`/events/${id}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-lg transition-colors">
            ← Retour à l'événement
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventReport;