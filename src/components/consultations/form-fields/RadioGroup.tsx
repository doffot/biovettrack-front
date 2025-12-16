// src/components/consultations/form-fields/RadioGroup.tsx
interface RadioGroupProps {
  label: string;
  name: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export default function RadioGroup({
  label,
  name,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
          />
          <span className="text-sm text-gray-700">Sí</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 text-vet-primary focus:ring-vet-primary"
          />
          <span className="text-sm text-gray-700">No</span>
        </label>
      </div>
    </div>
  );
}