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
      <label className="block text-vet-text font-semibold mb-2 text-sm">
        WhatsApp <span className="text-red-500">*</span>
      </label>

      <div className={`
        flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200
        ${error 
          ? 'bg-red-50 border-red-300' 
          : 'bg-vet-light border-gray-300 hover:border-gray-400 focus-within:border-vet-primary'
        }
      `}>
        <div className={`p-1.5 rounded ${error ? 'bg-red-100 text-red-500' : 'bg-vet-primary/10 text-vet-primary'}`}>
          <Phone className="w-4 h-4" />
        </div>

        <select
          value={selectedCountry.dialCode}
          onChange={handleCountryChange}
          className="bg-transparent text-vet-text focus:outline-none text-sm font-medium pr-2 cursor-pointer appearance-none"
          style={{ width: '70px' }}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.dialCode} className="bg-white text-vet-text">
              {country.dialCode}
            </option>
          ))}
        </select>

        <div className="h-6 w-px bg-gray-300" />

        <input
          type="tel"
          placeholder="Número de teléfono"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="flex-1 bg-transparent text-vet-text placeholder-vet-muted focus:outline-none text-sm"
        />
      </div>

      {error && (
        <p className="mt-1 text-red-600 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
          {error}
        </p>
      )}

      {!error && (
        <p className="text-vet-muted text-xs mt-1">
          Ej: <span className="font-mono text-vet-text">3001234567</span> → se convierte en <span className="font-mono text-vet-primary">{selectedCountry.dialCode}3001234567</span>
        </p>
      )}
    </div>
  );
};