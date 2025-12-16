// src/components/consultations/form-fields/TextArea.tsx
interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

export default function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength = 300,
  rows = 2,
}: TextAreaProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}