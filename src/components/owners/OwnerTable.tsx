// src/views/owners/components/OwnerTable.tsx
import { ArrowUpDown, ArrowUp, ArrowDown, MessageCircle, Trash2, ChevronRight } from "lucide-react";
import type { OwnerWithStats } from "../../view/owner/OwnerListView";
import type { Owner } from "../../types";

type SortField = "name" | "petsCount" | "lastVisit" | "totalDebt";
type SortDirection = "asc" | "desc";

interface Props {
  owners: OwnerWithStats[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onNavigate: (id: string) => void;
  onWhatsApp: (phone: string) => void;
  onDelete: (owner: Owner) => void;
}

export default function OwnerTable({
  owners,
  sortField,
  sortDirection,
  onSort,
  selectedIds,
  allSelected,
  onSelectAll,
  onSelectOne,
  onNavigate,
  onWhatsApp,
  onDelete,
}: Props) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-vet-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-vet-primary" />
    );
  };

  const formatLastVisit = (date: string | null) => {
    if (!date) return "—";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 7) return `Hace ${diff}d`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)}sem`;
    return d.toLocaleDateString();
  };

 

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-vet-primary focus:ring-vet-primary"
              />
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-1.5">
                Nombre <SortIcon field="name" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide">
              Teléfono
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide hidden xl:table-cell">
              Email
            </th>
            <th
              className="px-4 py-3 text-center text-xs font-semibold text-vet-muted uppercase tracking-wide cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("petsCount")}
            >
              <div className="flex items-center justify-center gap-1.5">
                Mascotas <SortIcon field="petsCount" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-vet-muted uppercase tracking-wide cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("lastVisit")}
            >
              <div className="flex items-center gap-1.5">
                Última visita <SortIcon field="lastVisit" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-semibold text-vet-muted uppercase tracking-wide cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("totalDebt")}
            >
              <div className="flex items-center justify-end gap-1.5">
                Deuda <SortIcon field="totalDebt" />
              </div>
            </th>
            <th className="px-4 py-3 w-28"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {owners.map((owner) => (
            <tr
              key={owner._id}
              className="group hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onNavigate(owner._id)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(owner._id)}
                  onChange={(e) => onSelectOne(owner._id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-vet-primary focus:ring-vet-primary"
                />
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-vet-text">{owner.name}</p>
                  {owner.nationalId && (
                    <p className="text-xs text-vet-muted">{owner.nationalId}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-vet-text">{owner.contact}</td>
              <td className="px-4 py-3 text-sm text-vet-muted hidden xl:table-cell truncate max-w-[200px]">
                {owner.email || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-vet-text text-center">{owner.petsCount}</td>
              <td className="px-4 py-3 text-sm text-vet-muted">{formatLastVisit(owner.lastVisit)}</td>
           <td className="px-4 py-3 text-right">
  {owner.totalDebt > 0 ? (
    <span className="inline-block px-2 py-1 text-xs font-medium bg-red-500 text-white rounded">
      ${owner.totalDebt.toFixed(2)}
    </span>
  ) : (
    <span className="text-sm text-green-600">Al día</span>
  )}
</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onWhatsApp(owner.contact)}
                    className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(owner)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}