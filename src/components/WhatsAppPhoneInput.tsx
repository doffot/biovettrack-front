import React, { useState, useEffect, useRef } from "react";
import { Phone } from "lucide-react";

type Country = {
  name: string;
  code: string;
  dialCode: string;
};

const countries: Country[] = [
  { name: "Venezuela", code: "VE", dialCode: "+58" },
  { name: "Colombia", code: "CO", dialCode: "+57" },
  { name: "México", code: "MX", dialCode: "+52" },
  { name: "Argentina", code: "AR", dialCode: "+54" },
  { name: "España", code: "ES", dialCode: "+34" },
  { name: "Estados Unidos", code: "US", dialCode: "+1" },
  { name: "Chile", code: "CL", dialCode: "+56" },
  { name: "Perú", code: "PE", dialCode: "+51" },
  { name: "Ecuador", code: "EC", dialCode: "+593" },
  { name: "Brasil", code: "BR", dialCode: "+55" },
  { name: "Panamá", code: "PA", dialCode: "+507" },
  { name: "Costa Rica", code: "CR", dialCode: "+506" },
  { name: "Guatemala", code: "GT", dialCode: "+502" },
  { name: "Bolivia", code: "BO", dialCode: "+591" },
  { name: "Paraguay", code: "PY", dialCode: "+595" },
  { name: "Uruguay", code: "UY", dialCode: "+598" },
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
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const isUserTyping = useRef(false);

  const inputStyle = { backgroundColor: "var(--color-vet-sidebar)" };

  useEffect(() => {
    if (isUserTyping.current) return;

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
      <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
        <div className="p-1 bg-emerald-500/10 rounded">
          <Phone className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        WhatsApp <span className="text-vet-danger">*</span>
      </label>

      <div className="flex gap-2">
        {/* Selector de país - Solo muestra el código */}
        <select
          value={selectedCountry.dialCode}
          onChange={handleCountryChange}
          style={inputStyle}
          className="w-20 px-2 py-2.5 border border-border rounded-xl text-sm text-vet-text focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all cursor-pointer"
        >
          {countries.map((country) => (
            <option 
              key={country.code} 
              value={country.dialCode}
              style={{ 
                backgroundColor: "var(--color-card)", 
                color: "var(--color-vet-text)" 
              }}
            >
              {country.dialCode}
            </option>
          ))}
        </select>

        {/* Input de teléfono */}
        <input
          type="tel"
          placeholder="412 123 4567"
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={15}
          style={inputStyle}
          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-vet-danger">{error}</p>
      )}
    </div>
  );
};