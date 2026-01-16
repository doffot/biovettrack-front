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
      <label className="block text-xs font-medium text-[var(--color-vet-muted)] mb-1">
        {label}
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 text-[var(--color-vet-primary)] focus:ring-[var(--color-vet-primary)]"
          />
          <span className="text-sm text-[var(--color-vet-text)]">Sí</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 text-[var(--color-vet-primary)] focus:ring-[var(--color-vet-primary)]"
          />
          <span className="text-sm text-[var(--color-vet-text)]">No</span>
        </label>
      </div>
    </div>
  );
}