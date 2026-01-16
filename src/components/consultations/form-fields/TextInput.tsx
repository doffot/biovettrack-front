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
      <label 
        className={`block mb-1 ${
          sublabel 
            ? "text-xs text-[var(--color-vet-muted)]" 
            : "text-xs font-medium text-[var(--color-vet-muted)]"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] placeholder:text-[var(--color-vet-muted)] transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}