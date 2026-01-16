// src/components/owners/OwnerTable.tsx
import { ArrowUpDown, ArrowUp, ArrowDown, MessageCircle, Trash2, ChevronRight } from "lucide-react";
import type { Owner } from "../../types";
import type { OwnerWithStats } from "../../view/owner/OwnerListView";

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
      <ArrowUp className="w-3 h-3 text-vet-accent" />
    ) : (
      <ArrowDown className="w-3 h-3 text-vet-accent" />
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
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl">
      <table className="w-full">
        <thead className="bg-slate-800/60 border-b border-white/10">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-slate-700 text-vet-accent focus:ring-vet-accent/50 focus:ring-offset-0 focus:ring-offset-transparent"
              />
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-1.5">
                Nombre <SortIcon field="name" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Teléfono
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden xl:table-cell">
              Email
            </th>
            <th
              className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => onSort("petsCount")}
            >
              <div className="flex items-center justify-center gap-1.5">
                Mascotas <SortIcon field="petsCount" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => onSort("lastVisit")}
            >
              <div className="flex items-center gap-1.5">
                Última visita <SortIcon field="lastVisit" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => onSort("totalDebt")}
            >
              <div className="flex items-center justify-end gap-1.5">
                Deuda <SortIcon field="totalDebt" />
              </div>
            </th>
            <th className="px-4 py-3 w-28"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {owners.map((owner) => (
            <tr
              key={owner._id}
              className="group hover:bg-white/5 cursor-pointer transition-all duration-200"
              onClick={() => onNavigate(owner._id)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(owner._id)}
                  onChange={(e) => onSelectOne(owner._id, e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-slate-700 text-vet-accent focus:ring-vet-accent/50 focus:ring-offset-0 focus:ring-offset-transparent"
                />
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-white">{owner.name}</p>
                  {owner.nationalId && (
                    <p className="text-xs text-slate-500">{owner.nationalId}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-300">{owner.contact}</span>
              </td>
              <td className="px-4 py-3 hidden xl:table-cell">
                <span className="text-sm text-slate-400 truncate block max-w-[200px]">
                  {owner.email || "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 text-white text-sm font-medium">
                  {owner.petsCount}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-sm ${
                  owner.lastVisit && new Date(owner.lastVisit).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                    ? 'text-emerald-400'
                    : owner.lastVisit && new Date(owner.lastVisit).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}>
                  {formatLastVisit(owner.lastVisit)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {owner.totalDebt > 0 ? (
                  <div className="flex items-center justify-end gap-1">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
                      ${owner.totalDebt.toFixed(2)}
                    </span>
                    {owner.pendingInvoices > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {owner.pendingInvoices}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    Al día
                  </span>
                )}
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => onWhatsApp(owner.contact)}
                    className="p-1.5 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-all duration-200 border border-transparent hover:border-green-500/30"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(owner)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/30"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600 ml-1" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}