// src/views/dashboard/components/GroomingSection.tsx
import { Scissors, ChevronRight, User, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatTime } from "../../utils/dashboardUtils";
import { getOwners } from "../../api/OwnerAPI";
import { getPatients } from "../../api/patientAPI";
import type { GroomingService } from "../../types";
import type { Owner } from "../../types/owner";
import type { Patient } from "../../types/patient";
import { useMemo } from "react";

interface GroomingSectionProps {
  groomingServices: GroomingService[];
}

export function GroomingSection({ groomingServices }: GroomingSectionProps) {
  const navigate = useNavigate();
  const isEmpty = groomingServices.length === 0;

  // Obtener owners y pacientes con tipos explícitos
  const { data: owners = [] } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
    staleTime: 1000 * 60 * 5,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: getPatients,
    staleTime: 1000 * 60 * 5,
  });

  // Crear mapas con tipos explícitos
  const ownersMap = useMemo(() => {
    const map = new Map<string, Owner>();
    (owners as Owner[]).forEach((owner: Owner) => {
      map.set(owner._id, owner);
    });
    return map;
  }, [owners]);

  const patientsMap = useMemo(() => {
    const map = new Map<string, Patient>();
    (patients as Patient[]).forEach((patient: Patient) => {
      map.set(patient._id, patient);
    });
    return map;
  }, [patients]);

  const getServiceInfo = (service: GroomingService) => {
    let patientId = "";
    let patientName = "Paciente";
    let ownerName = "Sin dueño";
    let ownerContact = "";

    // Si patientId es string, buscar en el mapa de pacientes
    if (typeof service.patientId === "string") {
      patientId = service.patientId;
      const patient = patientsMap.get(patientId);
      
      if (patient) {
        patientName = patient.name;
        
        // Buscar información del owner
        if (typeof patient.owner === "string") {
          const owner = ownersMap.get(patient.owner);
          if (owner) {
            ownerName = owner.name;
            ownerContact = owner.contact || "";
          }
        } else if (typeof patient.owner === "object" && patient.owner) {
          ownerName = patient.owner.name;
          // Si necesitas el contacto, busca en el mapa
          const owner = ownersMap.get(patient.owner._id);
          if (owner) {
            ownerContact = owner.contact || "";
          }
        }
      }
    } 
    // Si patientId es objeto
    else if (typeof service.patientId === "object" && service.patientId) {
      patientId = service.patientId._id || "";
      patientName = service.patientId.name || "Paciente";
      
      // Extraer información del owner
      if (service.patientId.owner) {
        if (typeof service.patientId.owner === "string") {
          // Buscar en el mapa de owners
          const owner = ownersMap.get(service.patientId.owner);
          if (owner) {
            ownerName = owner.name;
            ownerContact = owner.contact || "";
          }
        } else if (typeof service.patientId.owner === "object") {
          ownerName = service.patientId.owner.name || "Sin dueño";
          // Buscar contacto completo en el mapa
          const ownerId = service.patientId.owner._id;
          if (ownerId) {
            const owner = ownersMap.get(ownerId);
            if (owner) {
              ownerContact = owner.contact || "";
            }
          }
        }
      }
    }

    return { patientId, patientName, ownerName, ownerContact };
  };

  const handleServiceClick = (service: GroomingService) => {
    const { patientId } = getServiceInfo(service);
    if (patientId) {
      navigate(`/patients/${patientId}/grooming-services/${service._id}`);
    }
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
            to="/grooming-services"
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
              const serviceInfo = getServiceInfo(service);
              return (
                <div 
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="cursor-pointer"
                >
                  <GroomingItem
                    time={formatTime(service.date)}
                    patientName={serviceInfo.patientName}
                    ownerName={serviceInfo.ownerName}
                    ownerContact={serviceInfo.ownerContact}
                    service={service.service}
                    specifications={service.specifications}
                    status={service.status}
                  />
                </div>
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
                  const serviceInfo = getServiceInfo(service);
                  return (
                    <div 
                      key={service._id}
                      onClick={() => handleServiceClick(service)}
                      className="cursor-pointer"
                    >
                      <GroomingItem
                        time={formatTime(service.date)}
                        patientName={serviceInfo.patientName}
                        ownerName={serviceInfo.ownerName}
                        ownerContact={serviceInfo.ownerContact}
                        service={service.service}
                        specifications={service.specifications}
                        status={service.status}
                      />
                    </div>
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

// Componente interno
function GroomingItem({ 
  time, 
  patientName, 
  ownerName,
  ownerContact, 
  service, 
  specifications,
  status 
}: {
  time: string;
  patientName: string;
  ownerName: string;
  ownerContact: string;
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

  const formatContact = (contact: string) => {
    if (!contact) return "";
    if (contact.length > 11) {
      return `...${contact.slice(-8)}`;
    }
    return contact;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-200/50 hover:shadow-md hover:border-purple-300 transition-all duration-200 group animate-fadeIn">
      <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
        <Scissors className="w-4 h-4 text-purple-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-vet-text text-sm truncate group-hover:text-vet-primary transition-colors">
            {patientName}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-vet-muted">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate">{ownerName}</span>
          </div>
          {ownerContact && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span className="text-[10px]">{formatContact(ownerContact)}</span>
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-purple-600 mt-0.5">{service} - {specifications}</p>
      </div>
      
      <div className="text-xs font-medium text-vet-primary bg-purple-50 px-2 py-1.5 rounded-lg">
        {time}
      </div>
    </div>
  );
}