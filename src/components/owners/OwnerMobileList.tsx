// src/views/owners/components/OwnerMobileList.tsx
import { MessageCircle, Trash2, ChevronRight } from "lucide-react";
import type { OwnerWithStats } from "../../view/owner/OwnerListView";
import type { Owner } from "../../types";

interface Props {
  owners: OwnerWithStats[];
  selectedIds: Set<string>;
  onSelectOne: (id: string, checked: boolean) => void;
  onNavigate: (id: string) => void;
  onWhatsApp: (phone: string) => void;
  onDelete: (owner: Owner) => void;
}

export default function OwnerMobileList({
  owners,
  selectedIds,
  onSelectOne,
  onNavigate,
  onWhatsApp,
  onDelete,
}: Props) {
  const formatLastVisit = (date: string | null) => {
    if (!date) return "Sin visitas";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-2">
      {owners.map((owner) => (
        <div
          key={owner._id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-vet-primary/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(owner._id)}
              onChange={(e) => onSelectOne(owner._id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-vet-primary focus:ring-vet-primary"
            />

            <div
              className="flex-1 min-w-0"
              onClick={() => onNavigate(owner._id)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-vet-text truncate">
                  {owner.name}
                </h3>
                {owner.totalDebt > 0 && (
                  <span className="text-xs font-medium bg-red-500 text-white px-2 py-0.5 rounded">
                    ${owner.totalDebt.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-vet-muted">
                <span>{owner.contact}</span>
                <span>
                  {owner.petsCount} mascota{owner.petsCount !== 1 ? "s" : ""}
                </span>
                <span className="col-span-2">
                  {formatLastVisit(owner.lastVisit)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onWhatsApp(owner.contact)}
                className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(owner)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate(owner._id)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
