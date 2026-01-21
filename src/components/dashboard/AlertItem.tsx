// src/components/dashboard/AlertItem.tsx
import { useNavigate } from "react-router-dom";
import { Syringe, Bug, PawPrint, User } from "lucide-react";
import type { Patient, Owner } from "../../types";

export type AlertType = "vacuna" | "desparasitacion";

interface AlertItemProps {
  title: string;
  type: AlertType;
  daysLeft: number;
  patientData?: Patient;
  ownerData?: Owner;
}

export function AlertItem({ title, type, daysLeft, patientData, ownerData }: AlertItemProps) {
  const navigate = useNavigate();
  const isUrgent = daysLeft <= 3;
  const Icon = type === "vacuna" ? Syringe : Bug;

  const getDaysLabel = () => {
    if (daysLeft === 0) return "Hoy";
    if (daysLeft === 1) return "Mañana";
    return `${daysLeft}d`;
  };

  return (
    <div
      onClick={() => patientData?._id && navigate(`/patients/${patientData._id}`)}
      style={{
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
      className={`
        flex items-center gap-2.5 p-2.5 rounded-xl 
        border backdrop-blur-sm cursor-pointer
        hover:translate-x-1 hover:shadow-md
        ${
          isUrgent 
            ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 hover:shadow-red-500/10" 
            : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-amber-500/10"
        }
      `}
    >
      {/* Miniatura de la Mascota */}
      <div className="relative flex-shrink-0">
        <div className={`
          w-9 h-9 rounded-full border overflow-hidden flex items-center justify-center bg-background
          ${isUrgent ? "border-red-500/30" : "border-amber-500/30"}
        `}>
          {patientData?.photo ? (
            <img 
              src={patientData.photo} 
              alt={patientData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground">
              <PawPrint className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className={`
          absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border shadow-sm
          ${isUrgent ? "bg-red-500 text-white border-red-200" : "bg-amber-500 text-white border-amber-200"}
        `}>
          <Icon className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Información principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-foreground text-xs sm:text-sm truncate">
            {patientData?.name || "Cargando..."}
          </p>
          {isUrgent && (
            <div className="flex h-1.5 w-1.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </div>
          )}
        </div>
        
        <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight mt-0.5">
          {title}
        </p>
        
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 mt-0.5">
          <User className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">
            {ownerData 
              ? `${ownerData.name}${ownerData.contact ? ` • ${ownerData.contact}` : ''}`
              : patientData ? "Buscando dueño..." : "---"}
          </span>
        </div>
      </div>

      {/* Badge de días restantes */}
      <div
        className={`
          text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0
          ${
            isUrgent 
              ? "bg-red-500/10 text-red-600 border-red-500/20" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }
        `}
      >
        {getDaysLabel()}
      </div>
    </div>
  );
}