import { useState, useEffect } from 'react';

const CITIES_BY_INDICATIF = {
  '+237': ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kumba', 'Limbe', 'Kribi', 'Buea', 'Edéa', 'Nkongsamba'],
  '+235': ['N\'Djaména', 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Koumra', 'Pala', 'Am Timan', 'Bongor', 'Doba'],
  '+225': ['Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'Yamoussoukro', 'San-Pédro', 'Divo', 'Gagnoa', 'Abengourou', 'Man'],
  '+221': ['Dakar', 'Touba', 'Thiès', 'Rufisque', 'Kaolack', 'Ziguinchor', 'Saint-Louis', 'Diourbel', 'Louga', 'Tambacounda'],
  '+242': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Impfondo', 'Ouesso', 'Owando'],
  '+241': ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné'],
  '+243': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Bukavu', 'Goma', 'Tshikapa'],
  '+33': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  '+32': ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur'],
  '+41': ['Zurich', 'Genève', 'Bâle', 'Berne', 'Lausanne', 'Lucerne'],
  '+1': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Toronto', 'Montréal', 'Vancouver'],
  '+44': ['Londres', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool'],
  '+212': ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda'],
  '+234': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Enugu'],
  '+27': ['Johannesburg', 'Le Cap', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'],
};

function CitySelect({ indicatif, value, onChange }) {
  const [showOther, setShowOther] = useState(false);
  const [otherCity, setOtherCity] = useState('');
  const cities = CITIES_BY_INDICATIF[indicatif] || [];

  useEffect(() => {
    setShowOther(false);
    setOtherCity('');
    onChange('');
  }, [indicatif]);

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === 'autre') {
      setShowOther(true);
      onChange('');
    } else {
      setShowOther(false);
      onChange(val);
    }
  };

  const handleOtherChange = (e) => {
    setOtherCity(e.target.value);
    onChange(e.target.value);
  };

  if (cities.length === 0) {
    return (
      <input
        placeholder="Votre ville"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={showOther ? 'autre' : (value || '')}
        onChange={handleSelect}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
      >
        <option value="">-- Choisir une ville --</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
        <option value="autre">Autre ville...</option>
      </select>
      {showOther && (
        <input
          placeholder="Entrez le nom de votre ville"
          value={otherCity}
          onChange={handleOtherChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          autoFocus
        />
      )}
    </div>
  );
}

export default CitySelect;