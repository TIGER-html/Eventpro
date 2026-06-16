import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

function About() {
  const team = [
    { name: 'Équipe Organisation', role: 'Coordination & Planification', icon: '📋' },
    { name: 'Équipe Technique', role: 'Développement & Support', icon: '💻' },
    { name: 'Équipe Commerciale', role: 'Partenariats & Prestataires', icon: '🤝' },
  ];

  const values = [
    { icon: '✨', title: 'Excellence', desc: 'Nous nous engageons à fournir des prestations de la plus haute qualité pour chaque événement.' },
    { icon: '🤝', title: 'Confiance', desc: 'La transparence et l\'honnêteté sont au cœur de chacune de nos interactions.' },
    { icon: '🎯', title: 'Précision', desc: 'Chaque détail compte. Nous planifions avec rigueur pour un résultat parfait.' },
    { icon: '💡', title: 'Innovation', desc: 'Nous utilisons les meilleures technologies pour simplifier l\'organisation d\'événements.' },
    { icon: '🌍', title: 'Localité', desc: 'Profondément ancrés au Cameroun, nous comprenons les besoins locaux.' },
    { icon: '💚', title: 'Passion', desc: 'Organiser des événements inoubliables, c\'est notre passion et notre mission.' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-20 px-4 text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          À propos d'<span className="text-accent-400">EventPro</span>
        </h1>
        <p className="text-primary-200 text-lg max-w-2xl mx-auto">
          La plateforme numéro 1 au Cameroun pour l'organisation d'événements inoubliables.
          Fondée avec la passion de simplifier la gestion événementielle.
        </p>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-900 mb-4">Notre mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            EventPro Cameroun a été créé pour répondre à un besoin réel : organiser un événement au Cameroun
            est souvent complexe, stressant et coûteux. Notre mission est de simplifier radicalement ce processus
            en réunissant clients, prestataires et organisateurs sur une seule plateforme intelligente.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-primary-900 text-center mb-10">Nos valeurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 hover:border-primary-200 transition-colors">
                <span className="text-3xl block mb-3">{v.icon}</span>
                <h3 className="font-heading font-bold text-primary-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-primary-900 text-center mb-10">Notre équipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-primary-50 rounded-2xl p-6 text-center border border-primary-100">
                <span className="text-4xl block mb-3">{member.icon}</span>
                <h3 className="font-heading font-bold text-primary-900">{member.name}</h3>
                <p className="text-primary-600 text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '500+', label: 'Événements organisés' },
            { num: '98%', label: 'Clients satisfaits' },
            { num: '50+', label: 'Prestataires partenaires' },
            { num: '5 ans', label: 'D\'expérience' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="font-heading text-3xl font-bold text-accent-400">{stat.num}</p>
              <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center bg-white">
        <h2 className="font-heading text-2xl font-bold text-primary-900 mb-4">Prêt à nous rejoindre ?</h2>
        <p className="text-gray-500 mb-6">Rejoignez des centaines de clients qui nous font confiance.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="bg-primary-700 hover:bg-primary-800 text-white font-bold px-8 py-3 rounded-xl transition-colors">
            Créer un compte
          </Link>
          <Link to="/" className="border border-gray-200 hover:border-primary-300 text-gray-600 font-semibold px-8 py-3 rounded-xl transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;