import type { Staff } from "../../../types/staff";

type StaffSelectorProps = {
  staffList: Staff[];
  selectedStaffId: string | null;
  onSelect: (staffId: string) => void;
  currentVetId?: string;
  currentVetName?: string;
  currentVetLastName?: string;
  isLoading?: boolean;
};

export default function StaffSelector({
  staffList,
  selectedStaffId,
  onSelect,
  currentVetId,
  currentVetName,
  currentVetLastName,
  isLoading = false,
}: StaffSelectorProps) {
  const veterinarians = staffList.filter(
    (s) => s.role === "veterinario" && s.active
  );

  if (isLoading) {
    return (
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-soft">
        <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3">
          Veterinario que atenderá
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-28 bg-[var(--color-hover)] rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-soft">
      <h3 className="text-sm font-semibold text-[var(--color-vet-text)] mb-3">
        Veterinario que atenderá
      </h3>

      <div className="flex flex-wrap gap-2">
        {currentVetId && (
          <button
            type="button"
            onClick={() => onSelect(currentVetId)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
              ${
                selectedStaffId === currentVetId
                  ? "bg-[var(--color-vet-primary)] text-white shadow-md border-[var(--color-vet-primary)]"
                  : "bg-[var(--color-hover)] text-[var(--color-vet-text)] hover:bg-[var(--color-vet-accent)] hover:text-white border-[var(--color-border)]"
              }
            `}
          >
            {currentVetName} {currentVetLastName}
          </button>
        )}

        {veterinarians
          .filter((s) => !s.isOwner)
          .map((staff) => (
            <button
              key={staff._id}
              type="button"
              onClick={() => onSelect(staff._id!)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                ${
                  selectedStaffId === staff._id
                    ? "bg-[var(--color-vet-primary)] text-white shadow-md border-[var(--color-vet-primary)]"
                    : "bg-[var(--color-hover)] text-[var(--color-vet-text)] hover:bg-[var(--color-vet-accent)] hover:text-white border-[var(--color-border)]"
                }
              `}
            >
              {staff.name} {staff.lastName}
            </button>
          ))}
      </div>
    </div>
  );
}