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
  value: string; // Formato: "+573001234567"
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

  // Parsear el valor inicial o cuando viene de fuera (ej: modo edición)
  useEffect(() => {
    // Si el usuario está escribiendo, no sobrescribir
    if (isUserTyping.current) {
      return;
    }

    if (!value) {
      setSelectedCountry(countries[0]);
      setPhoneNumber("");
      return;
    }

    // Buscar el país que coincida con el código
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
    const val = e.target.value.replace(/\D/g, ''); // Solo dígitos
    setPhoneNumber(val);
    onChange(selectedCountry.dialCode + val);
    setTimeout(() => { isUserTyping.current = false; }, 100);
  };

  return (
    <div>
      <label className="block text-text font-semibold mb-3 text-sm">
        Teléfono (WhatsApp)
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative group">
        <div className={`
          relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm transition-all duration-300
          ${error 
            ? 'bg-danger/10 border-danger/30 shadow-[0_0_20px_rgba(255,94,91,0.2)]' 
            : 'bg-background/40 border-muted/20 hover:border-primary/30 focus-within:border-primary/50'
          }
        `}>
          {/* Efecto shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex items-center p-4">
            <div className={`p-2 rounded-xl bg-black/20 mr-3 transition-colors duration-300 ${
              error ? 'text-danger' : 'text-primary group-hover:text-primary'
            }`}>
              <Phone className="w-5 h-5" />
            </div>
            
            {/* Select de país */}
            <select
              value={selectedCountry.dialCode}
              onChange={handleCountryChange}
              className="bg-transparent text-text focus:outline-none text-sm font-medium pr-2 cursor-pointer"
              style={{ width: '70px' }}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.dialCode} className="bg-background text-text">
                  {country.dialCode}
                </option>
              ))}
            </select>

            {/* Separador visual */}
            <div className="h-6 w-px bg-muted/30 mx-2" />

            {/* Input de número */}
            <input
              type="tel"
              placeholder="Número de teléfono"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="flex-1 bg-transparent text-text placeholder-muted focus:outline-none text-sm"
            />
          </div>

          {/* Líneas decorativas */}
          <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent opacity-60 transition-colors duration-300 ${
            error ? 'via-danger/50' : 'via-primary/50'
          }`} />
          <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent transition-colors duration-300 ${
            error ? 'via-danger/30' : 'via-primary/30'
          }`} />
        </div>

        {/* Decoración de esquina */}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-neon-pulse opacity-60 transition-colors duration-300 ${
          error ? 'bg-danger' : 'bg-primary'
        }`} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-danger text-xs">
          <div className="w-1 h-1 bg-danger rounded-full animate-neon-pulse" />
          {error}
        </div>
      )}

      {/* Ayuda visual */}
      {!error && (
        <p className="text-muted/60 text-xs mt-2">
          Ej: <span className="font-mono">3001234567</span> → se convierte en <span className="font-mono">{selectedCountry.dialCode}3001234567</span>
        </p>
      )}
    </div>
  );
};