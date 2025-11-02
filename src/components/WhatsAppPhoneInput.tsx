// src/components/WhatsAppPhoneInput.tsx
import React, { useState, useEffect, useRef } from "react";
import { Phone } from "lucide-react";

type Country = {
  name: string;
  code: string;
  dialCode: string;
};

const countries: Country[] = [
  { name: "Colombia", code: "CO", dialCode: "+57" },
  { name: "México", code: "MX", dialCode: "+52" },
  { name: "Argentina", code: "AR", dialCode: "+54" },
  { name: "España", code: "ES", dialCode: "+34" },
  { name: "Estados Unidos", code: "US", dialCode: "+1" },
  { name: "Brasil", code: "BR", dialCode: "+55" },
  { name: "Perú", code: "PE", dialCode: "+51" },
  { name: "Chile", code: "CL", dialCode: "+56" },
  { name: "Ecuador", code: "EC", dialCode: "+593" },
  { name: "Venezuela", code: "VE", dialCode: "+58" },
  { name: "Panamá", code: "PA", dialCode: "+507" },
  { name: "Costa Rica", code: "CR", dialCode: "+506" },
  { name: "Guatemala", code: "GT", dialCode: "+502" },
  { name: "Bolivia", code: "BO", dialCode: "+591" },
  { name: "Paraguay", code: "PY", dialCode: "+595" },
  { name: "Uruguay", code: "UY", dialCode: "+598" },
  { name: "República Dominicana", code: "DO", dialCode: "+1-809" },
  { name: "Puerto Rico", code: "PR", dialCode: "+1-787" },
];

interface WhatsAppPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const WhatsAppPhoneInput: React.FC<WhatsAppPhoneInputProps> = ({
  value,
  onChange,
  error,
  required = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const isUserTyping = useRef(false);

  useEffect(() => {
    if (isUserTyping.current) {
      return;
    }

    if (!value) {
      setSelectedCountry(countries[0]);
      setPhoneNumber("");
      return;
    }

    let foundCountry = countries[0];
    let numberPart = value;

    for (const country of countries) {
      if (value.startsWith(country.dialCode)) {
        foundCountry = country;
        numberPart = value.substring(country.dialCode.length);
        break;
      }
    }

    setSelectedCountry(foundCountry);
    setPhoneNumber(numberPart);
  }, [value]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    isUserTyping.current = true;
    const code = e.target.value;
    const country = countries.find(c => c.dialCode === code) || countries[0];
    setSelectedCountry(country);
    onChange(code + phoneNumber);
    setTimeout(() => { isUserTyping.current = false; }, 100);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserTyping.current = true;
    const val = e.target.value.replace(/\D/g, '');
    setPhoneNumber(val);
    onChange(selectedCountry.dialCode + val);
    setTimeout(() => { isUserTyping.current = false; }, 100);
  };

  return (
    <div>
      <label className="block text-white font-medium mb-2 text-sm">
        Teléfono (WhatsApp)
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        ${error 
          ? 'bg-red-500/10 border-red-500/50' 
          : 'bg-gray-700/50 border-gray-700 hover:border-green-500/50 focus-within:border-green-500'
        } transition-colors
      `}>
        <div className={`p-1 rounded bg-gray-900 ${error ? 'text-red-500' : 'text-green-500'}`}>
          <Phone className="w-5 h-5" />
        </div>

        <select
          value={selectedCountry.dialCode}
          onChange={handleCountryChange}
          className="bg-transparent text-white focus:outline-none text-sm font-medium pr-2 cursor-pointer"
          style={{ width: '70px' }}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.dialCode} className="bg-gray-800 text-white">
              {country.dialCode}
            </option>
          ))}
        </select>

        <div className="h-6 w-px bg-gray-600" />

        <input
          type="tel"
          placeholder="Número de teléfono"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
        />
      </div>

      {error && (
        <p className="mt-2 text-red-400 text-xs flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full" />
          {error}
        </p>
      )}

      {!error && (
        <p className="text-gray-400 text-xs mt-2">
          Ej: <span className="font-mono">3001234567</span> → se convierte en <span className="font-mono">{selectedCountry.dialCode}3001234567</span>
        </p>
      )}
    </div>
  );
};