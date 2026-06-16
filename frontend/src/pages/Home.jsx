import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Footer from '../components/Footer';

function Home() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, rRes, gRes] = await Promise.all([
          api.get('/services'),
          api.get('/reviews/public'),
          api.get('/gallery/public'),
        ]);
        setServices(Array.isArray(sRes.data) ? sRes.data.slice(0, 6) : []);
        setReviews(Array.isArray(rRes.data) ? rRes.data.slice(0, 3) : []);
        setGallery(Array.isArray(gRes.data) ? gRes.data.slice(0, 6) : []);
      } catch {}
    };
    fetchData();
  }, []);

  const eventTypes = [
    { icon: '💍', label: 'Mariage' },
    { icon: '🎂', label: 'Anniversaire' },
    { icon: '🎤', label: 'Conférence' },
    { icon: '🎓', label: 'Soutenance' },
    { icon: '👶', label: 'Baptême' },
    { icon: '🥂', label: 'Gala' },
    { icon: '🎵', label: 'Concert' },
    { icon: '💼', label: 'Réunion pro' },
  ];

  const steps = [
    { num: '01', icon: '✏️', title: 'Créez votre événement', desc: 'Renseignez les détails de votre événement en quelques clics.' },
    { num: '02', icon: '🛎️', title: 'Choisissez vos services', desc: 'Sélectionnez parmi nos services professionnels : décoration, traiteur, son...' },
    { num: '03', icon: '📋', title: 'Recevez votre devis', desc: 'Un devis automatique et détaillé est généré instantanément.' },
    { num: '04', icon: '💳', title: 'Payez en ligne', desc: 'Orange Money, MTN MoMo ou en présentiel — au choix.' },
    { num: '05', icon: '🎉', title: 'Profitez !', desc: 'Notre équipe prend en charge tout le reste. Vous n\'avez plus qu\'à profiter.' },
  ];

  const categories = [...new Set(services.map(s => s.categorie))];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            🎉 Plateforme #1 au Cameroun
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Organisez vos événements<br />
            <span className="text-accent-400">sans stress.</span>
          </h1>
          <p className="text-primary-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            De la création à la réalisation, EventPro Cameroun vous accompagne à chaque étape pour des événements inoubliables.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105">
              Réserver un événement →
            </Link>
            <a href="#services" className="border border-primary-400 hover:border-white text-white font-semibold px-8 py-4 rounded-xl transition-colors">
              Voir nos services
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '500+', label: 'Événements réalisés' },
            { num: '98%', label: 'Clients satisfaits' },
            { num: '50+', label: 'Prestataires partenaires' },
            { num: '5 ans', label: 'D\'expérience' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="font-heading text-3xl font-bold text-primary-700">{stat.num}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TYPES D'ÉVÉNEMENTS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary-900">Tous types d'événements</h2>
            <p className="text-gray-500 mt-2">Nous organisons tous vos événements, qu'ils soient personnels ou professionnels</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {eventTypes.map((type, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card hover:shadow-cardHover transition-all p-6 text-center cursor-pointer group border border-gray-100 hover:border-primary-200">
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{type.icon}</span>
                <p className="font-semibold text-primary-900 text-sm">{type.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary-900">Nos services</h2>
            <p className="text-gray-500 mt-2">Des prestations professionnelles pour un événement parfait</p>
          </div>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat} className="mb-10">
                <h3 className="font-heading font-bold text-primary-700 text-lg mb-4 border-l-4 border-accent-500 pl-3">{cat}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.filter(s => s.categorie === cat).map((service) => (
                    <div key={service.id} className="bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-cardHover transition-all p-5 group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-primary-900">{service.nom}</h4>
                        <span className="text-xs bg-primary-50 text-primary-700 font-bold px-2 py-1 rounded-full">{Number(service.prix).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Décoration', 'Sonorisation', 'Photographie', 'Traiteur', 'Sécurité', 'Vidéo'].map((s, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-card p-5">
                  <h4 className="font-semibold text-primary-900">{s}</h4>
                  <p className="text-sm text-gray-500 mt-1">Service professionnel pour votre événement</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/register" className="inline-block bg-primary-700 hover:bg-primary-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-colors">
              Réserver nos services →
            </Link>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary-900">Comment ça marche ?</h2>
            <p className="text-gray-500 mt-2">5 étapes simples pour votre événement parfait</p>
          </div>
          <div className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 items-start bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary-700 text-white flex items-center justify-center font-heading font-bold shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-primary-900">{step.icon} {step.title}</h4>
                  <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIE */}
      {gallery.length > 0 && (
        <section id="galerie" className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-primary-900">Notre galerie</h2>
              <p className="text-gray-500 mt-2">Quelques-uns de nos événements réalisés</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden aspect-square bg-primary-100">
                  <img src={item.url} alt={item.description || 'Événement'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TÉMOIGNAGES */}
      <section id="temoignages" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-primary-900">Ce que disent nos clients</h2>
            <p className="text-gray-500 mt-2">Des milliers de clients nous font confiance</p>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(r.note)].map((_, i) => <span key={i} className="text-accent-500">⭐</span>)}
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4">"{r.commentaire}"</p>
                  <p className="font-semibold text-primary-900 text-sm">{r.first_name} {r.last_name}</p>
                  {r.event_name && <p className="text-gray-400 text-xs">{r.event_name}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { nom: 'Marie N.', note: 5, text: 'Service exceptionnel ! Mon mariage était parfait grâce à EventPro.' },
                { nom: 'Jean-Paul K.', note: 5, text: 'Organisation impeccable de notre conférence d\'entreprise. Je recommande vivement.' },
                { nom: 'Christelle M.', note: 5, text: 'L\'équipe est très professionnelle. L\'anniversaire surprise a été une réussite totale !' },
              ].map((r, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(r.note)].map((_, j) => <span key={j} className="text-accent-500">⭐</span>)}
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4">"{r.text}"</p>
                  <p className="font-semibold text-primary-900 text-sm">{r.nom}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-primary-900 to-primary-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Prêt à créer votre événement ?</h2>
          <p className="text-primary-200 text-lg mb-8">Rejoignez des centaines de clients satisfaits et organisez l'événement de vos rêves avec EventPro Cameroun.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105">
              Commencer gratuitement →
            </Link>
            <Link to="/login" className="border border-primary-400 hover:border-white text-white font-semibold px-8 py-4 rounded-xl transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;