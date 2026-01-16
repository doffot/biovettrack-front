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
      <label 
        className={`block mb-1 ${
          sublabel 
            ? "text-xs text-[var(--color-vet-muted)]" 
            : "text-xs font-medium text-[var(--color-vet-muted)]"
        }`}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vet-primary)]/20 focus:border-[var(--color-vet-primary)] bg-[var(--color-card)] text-[var(--color-vet-text)] transition-colors"
      >
        <option value="" className="bg-[var(--color-card)] text-[var(--color-vet-muted)]">
          Seleccionar
        </option>
        {options.map((opt) => (
          <option 
            key={opt.value} 
            value={opt.value}
            className="bg-[var(--color-card)] text-[var(--color-vet-text)]"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}