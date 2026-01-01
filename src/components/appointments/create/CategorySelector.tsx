// src/components/appointments/create/CategorySelector.tsx

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
    <div className="bg-white rounded-xl border border-vet-light p-4 shadow-soft">
      <h3 className="text-sm font-semibold text-vet-text mb-3">
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
                    ? "bg-vet-primary text-white shadow-md"
                    : "bg-vet-light text-vet-text hover:bg-vet-accent hover:text-white"
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