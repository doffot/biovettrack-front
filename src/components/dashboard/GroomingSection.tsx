// src/views/dashboard/components/GroomingSection.tsx
import { Scissors, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { formatTime } from "../../utils/dashboardUtils";
import type { GroomingService } from "../../types";

interface GroomingSectionProps {
  groomingServices: GroomingService[];
}

export function GroomingSection({ groomingServices }: GroomingSectionProps) {
  const isEmpty = groomingServices.length === 0;

  const getPatientInfo = (service: GroomingService) => {
    if (service.patientId && typeof service.patientId === "object") {
      const patientName = service.patientId.name || "Paciente";
      const ownerName = typeof service.patientId.owner === "object" 
        ? service.patientId.owner?.name || "Sin dueño"
        : "Sin dueño";
      return { patientName, ownerName };
    }
    return { patientName: "Paciente", ownerName: "Sin dueño" };
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-vet-light overflow-hidden animate-fade-in-up">
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 via-white to-purple-50 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-soft">
            <Scissors className="w-4 h-4 text-purple-600" />
          </div>
          Peluquería de Hoy
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-vet-muted shadow-soft">
            {groomingServices.length} {groomingServices.length === 1 ? 'servicio' : 'servicios'}
          </span>
          <Link
            to="/grooming"
            className="text-xs text-vet-primary hover:text-vet-accent font-medium flex items-center gap-0.5 transition-colors group"
          >
            Ver todos
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-50 rounded-full flex items-center justify-center animate-gentle-pulse">
              <Scissors className="w-8 h-8 text-purple-300" />
            </div>
            <p className="text-vet-text text-sm font-medium">Sin servicios programados</p>
            <p className="text-vet-muted text-xs mt-1">No hay servicios de peluquería para hoy</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {groomingServices.slice(0, 3).map((service) => {
              const { patientName, ownerName } = getPatientInfo(service);
              return (
                <GroomingItem
                  key={service._id}
                  time={formatTime(service.date)}
                  patientName={patientName}
                  ownerName={ownerName}
                  service={service.service}
                  specifications={service.specifications}
                  status={service.status}
                />
              );
            })}
            
            {groomingServices.length > 3 && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-vet-light"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-vet-muted">
                      {groomingServices.length - 3} más
                    </span>
                  </div>
                </div>
                {groomingServices.slice(3).map((service) => {
                  const { patientName, ownerName } = getPatientInfo(service);
                  return (
                    <GroomingItem
                      key={service._id}
                      time={formatTime(service.date)}
                      patientName={patientName}
                      ownerName={ownerName}
                      service={service.service}
                      specifications={service.specifications}
                      status={service.status}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente interno para cada servicio de grooming
function GroomingItem({ 
  time, 
  patientName, 
  ownerName, 
  service, 
  specifications,
  status 
}: {
  time: string;
  patientName: string;
  ownerName: string;
  service: string;
  specifications: string;
  status: string;
}) {
  const getStatusColor = () => {
    switch (status) {
      case "Completado": return "bg-green-100 text-green-700";
      case "En progreso": return "bg-amber-100 text-amber-700";
      case "Cancelado": return "bg-red-100 text-red-700";
      default: return "bg-purple-100 text-purple-700";
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200 group animate-fadeIn">
      <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
        <Scissors className="w-4 h-4 text-purple-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-vet-text text-sm truncate">{patientName}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-vet-muted">
          <User className="w-3 h-3" />
          <span className="truncate">{ownerName}</span>
        </div>
        <p className="text-xs text-purple-600 mt-0.5">{service} - {specifications}</p>
      </div>
      
      <div className="text-xs font-medium text-vet-primary bg-purple-50 px-2 py-1.5 rounded-lg">
        {time}
      </div>
    </div>
  );
}