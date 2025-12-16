// src/components/consultations/form-fields/TextInput.tsx
interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "date";
  sublabel?: boolean;
}

export default function TextInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength = 200,
  type = "text",
  sublabel = false,
}: TextInputProps) {
  return (
    <div>
      <label className={`block mb-1 ${sublabel ? "text-xs text-gray-500" : "text-xs font-medium text-gray-600"}`}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
        placeholder={placeholder}
      />
    </div>
  );
}