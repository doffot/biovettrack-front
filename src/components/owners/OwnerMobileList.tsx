// src/components/owners/OwnerMobileList.tsx
import { MessageCircle, Trash2, ChevronRight, User, PawPrint, Calendar, CreditCard } from "lucide-react";
import type { Owner } from "../../types";
import type { OwnerWithStats } from "../../view/owner/OwnerListView";

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

  const getLastVisitColor = (date: string | null) => {
    if (!date) return "text-slate-500";
    const d = new Date(date);
    const diff = Math.floor(
      (new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff <= 7) return "text-emerald-400";
    if (diff <= 30) return "text-slate-300";
    return "text-slate-500";
  };

  return (
    <div className="space-y-3">
      {owners.map((owner) => (
        <div
          key={owner._id}
          className="bg-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-vet-accent/30 hover:shadow-lg hover:shadow-vet-accent/5 transition-all duration-300 group"
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={selectedIds.has(owner._id)}
              onChange={(e) => onSelectOne(owner._id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-slate-700 text-vet-accent focus:ring-vet-accent/50 focus:ring-offset-0 focus:ring-offset-transparent"
            />

            {/* Content */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onNavigate(owner._id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vet-accent/20 to-cyan-500/10 border border-vet-accent/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-vet-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate">
                      {owner.name}
                    </h3>
                    {owner.nationalId && (
                      <p className="text-[10px] text-slate-500">{owner.nationalId}</p>
                    )}
                  </div>
                </div>
                
                {/* Debt Badge */}
                {owner.totalDebt > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/30">
                      <CreditCard className="w-3 h-3" />
                      ${owner.totalDebt.toFixed(2)}
                    </span>
                    {owner.pendingInvoices > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {owner.pendingInvoices}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    Al día
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {/* Phone */}
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">{owner.contact}</span>
                </div>
                
                {/* Pets */}
                <div className="flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    {owner.petsCount} mascota{owner.petsCount !== 1 ? "s" : ""}
                  </span>
                </div>
                
                {/* Last Visit */}
                <div className="col-span-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className={getLastVisitColor(owner.lastVisit)}>
                    {formatLastVisit(owner.lastVisit)}
                  </span>
                </div>
              </div>

              {/* Email if exists */}
              {owner.email && (
                <p className="text-xs text-slate-500 mt-2 truncate">
                  {owner.email}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsApp(owner.contact);
                }}
                className="p-2 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-all duration-200 border border-transparent hover:border-green-500/30"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(owner);
                }}
                className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/30"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(owner._id);
                }}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-vet-accent transition-all duration-200 group-hover:text-slate-300"
                title="Ver detalles"
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