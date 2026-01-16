import { appointmentTypesValues, type AppointmentType } from "../../../types/appointment";

type CategorySelectorProps = {
  selectedType: AppointmentType | null;
  onSelect: (type: AppointmentType) => void;
};

export default function CategorySelector({
  selectedType,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-soft">
      <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3">
        Tipo de cita
      </h3>

      <div className="flex flex-wrap gap-2">
        {appointmentTypesValues.map((type) => {
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isSelected
                    ? "bg-[var(--color-vet-primary)] text-white shadow-md"
                    : "bg-[var(--color-hover)] text-[var(--color-vet-text)] hover:bg-[var(--color-vet-accent)] hover:text-white border border-[var(--color-border)]"
                }
              `}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}