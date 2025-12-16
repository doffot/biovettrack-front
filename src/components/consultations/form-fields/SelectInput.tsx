// src/components/consultations/form-fields/SelectInput.tsx
interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  sublabel?: boolean;
}

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  sublabel = false,
}: SelectInputProps) {
  return (
    <div>
      <label className={`block mb-1 ${sublabel ? "text-xs text-gray-500" : "text-xs font-medium text-gray-600"}`}>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary bg-white"
      >
        <option value="">Seleccionar</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}