import { useState } from 'react';

const COUNTRIES = [
  { code: '+237', name: 'Cameroun 🇨🇲', digits: 9, flag: '🇨🇲' },
  { code: '+235', name: 'Tchad 🇹🇩', digits: 8, flag: '🇹🇩' },
  { code: '+225', name: 'Côte d\'Ivoire 🇨🇮', digits: 10, flag: '🇨🇮' },
  { code: '+221', name: 'Sénégal 🇸🇳', digits: 9, flag: '🇸🇳' },
  { code: '+242', name: 'Congo 🇨🇬', digits: 9, flag: '🇨🇬' },
  { code: '+241', name: 'Gabon 🇬🇦', digits: 8, flag: '🇬🇦' },
  { code: '+236', name: 'RCA 🇨🇫', digits: 8, flag: '🇨🇫' },
  { code: '+243', name: 'RDC 🇨🇩', digits: 9, flag: '🇨🇩' },
  { code: '+229', name: 'Bénin 🇧🇯', digits: 8, flag: '🇧🇯' },
  { code: '+228', name: 'Togo 🇹🇬', digits: 8, flag: '🇹🇬' },
  { code: '+223', name: 'Mali 🇲🇱', digits: 8, flag: '🇲🇱' },
  { code: '+226', name: 'Burkina Faso 🇧🇫', digits: 8, flag: '🇧🇫' },
  { code: '+227', name: 'Niger 🇳🇪', digits: 8, flag: '🇳🇪' },
  { code: '+33', name: 'France 🇫🇷', digits: 9, flag: '🇫🇷' },
  { code: '+32', name: 'Belgique 🇧🇪', digits: 9, flag: '🇧🇪' },
  { code: '+41', name: 'Suisse 🇨🇭', digits: 9, flag: '🇨🇭' },
  { code: '+1', name: 'USA/Canada 🇺🇸', digits: 10, flag: '🇺🇸' },
  { code: '+44', name: 'Royaume-Uni 🇬🇧', digits: 10, flag: '🇬🇧' },
  { code: '+49', name: 'Allemagne 🇩🇪', digits: 10, flag: '🇩🇪' },
  { code: '+212', name: 'Maroc 🇲🇦', digits: 9, flag: '🇲🇦' },
  { code: '+216', name: 'Tunisie 🇹🇳', digits: 8, flag: '🇹🇳' },
  { code: '+213', name: 'Algérie 🇩🇿', digits: 9, flag: '🇩🇿' },
  { code: '+234', name: 'Nigéria 🇳🇬', digits: 10, flag: '🇳🇬' },
  { code: '+254', name: 'Kenya 🇰🇪', digits: 9, flag: '🇰🇪' },
  { code: '+27', name: 'Afrique du Sud 🇿🇦', digits: 9, flag: '🇿🇦' },
];

function PhoneInput({ value, onChange, required }) {
  const [indicatif, setIndicatif] = useState('+237');
  const [numero, setNumero] = useState('');
  const [error, setError] = useState('');

  const country = COUNTRIES.find(c => c.code === indicatif) || COUNTRIES[0];

  const handleIndicatifChange = (e) => {
    setIndicatif(e.target.value);
    setNumero('');
    setError('');
    onChange('');
  };

  const handleNumeroChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setNumero(val);
    if (val.length > 0 && val.length !== country.digits) {
      setError(`Le numéro doit contenir exactement ${country.digits} chiffres pour ${country.name}`);
    } else {
      setError('');
    }
    if (val.length === country.digits) {
      onChange(`${indicatif}${val}`);
    } else {
      onChange('');
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={indicatif}
          onChange={handleIndicatifChange}
          className="border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm w-44 shrink-0"
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name.split(' ')[0]}</option>
          ))}
        </select>
        <input
          type="tel"
          value={numero}
          onChange={handleNumeroChange}
          placeholder={`${country.digits} chiffres`}
          maxLength={country.digits}
          className="border border-gray-200 rounded-lg px-4 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          required={required}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {!error && numero.length === country.digits && (
        <p className="text-green-600 text-xs mt-1">✅ Numéro valide : {indicatif}{numero}</p>
      )}
    </div>
  );
}

export { COUNTRIES };
export default PhoneInput;