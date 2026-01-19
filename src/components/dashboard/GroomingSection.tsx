import { Scissors, ChevronRight, User, Phone, Clock, Sparkles } from "lucide-react";
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

    if (typeof service.patientId === "string") {
      patientId = service.patientId;
      const patient = patientsMap.get(patientId);
      
      if (patient) {
        patientName = patient.name;
        
        if (typeof patient.owner === "string") {
          const owner = ownersMap.get(patient.owner);
          if (owner) {
            ownerName = owner.name;
            ownerContact = owner.contact || "";
          }
        } else if (typeof patient.owner === "object" && patient.owner) {
          ownerName = patient.owner.name;
          const owner = ownersMap.get(patient.owner._id);
          if (owner) {
            ownerContact = owner.contact || "";
          }
        }
      }
    } 
    else if (typeof service.patientId === "object" && service.patientId) {
      patientId = service.patientId._id || "";
      patientName = service.patientId.name || "Paciente";
      
      if (service.patientId.owner) {
        if (typeof service.patientId.owner === "string") {
          const owner = ownersMap.get(service.patientId.owner);
          if (owner) {
            ownerName = owner.name;
            ownerContact = owner.contact || "";
          }
        } else if (typeof service.patientId.owner === "object") {
          ownerName = service.patientId.owner.name || "Sin dueño";
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
    <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border overflow-hidden animate-fade-in-up shadow-card">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-500/5 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-vet-text flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Scissors className="w-4 h-4 text-purple-500" />
          </div>
          Peluquería de Hoy
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Badge contador */}
          <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full font-semibold border border-purple-500/20">
            {groomingServices.length} {groomingServices.length === 1 ? 'servicio' : 'servicios'}
          </span>
          
          {/* Link "Ver todos" */}
          <Link
            to="/grooming-services"
            className="text-xs text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium flex items-center gap-0.5 transition-colors group"
          >
            Ver todos
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {isEmpty ? (
          /* Estado vacío */
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-gentle-pulse blur-xl"></div>
              <div className="relative w-16 h-16 bg-purple-500/5 rounded-full flex items-center justify-center border border-purple-500/20">
                <Scissors className="w-8 h-8 text-purple-500/50" />
              </div>
            </div>
            <p className="text-vet-text text-sm font-medium">Sin servicios programados</p>
            <p className="text-vet-muted text-xs mt-1">No hay servicios de peluquería para hoy</p>
            
            {/* Botón CTA */}
            <Link
              to="/grooming-services"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Programar servicio
            </Link>
          </div>
        ) : (
          /* Lista de servicios */
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Primeros 3 servicios */}
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
                  />
                </div>
              );
            })}
            
            {/* Separador si hay más de 3 */}
            {groomingServices.length > 3 && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 py-1 text-vet-muted rounded-full border border-border shadow-sm">
                      +{groomingServices.length - 3} más
                    </span>
                  </div>
                </div>
                
                {/* Resto de servicios */}
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

function GroomingItem({ 
  time, 
  patientName, 
  ownerName,
  ownerContact, 
  service, 
  specifications
}: {
  time: string;
  patientName: string;
  ownerName: string;
  ownerContact: string;
  service: string;
  specifications: string;
}) {
  const formatContact = (contact: string) => {
    if (!contact) return "";
    if (contact.length > 11) {
      return `...${contact.slice(-8)}`;
    }
    return contact;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 hover:shadow-soft hover:shadow-purple-500/10 transition-all duration-300 group animate-fadeIn">
      {/* Icono */}
      <div className="relative flex-shrink-0">
        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <Scissors className="w-5 h-5 text-purple-500" />
        </div>
        
        {/* Badge decorativo */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500/20 rounded-full flex items-center justify-center border border-card shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-purple-500" />
        </div>
      </div>
      
      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-vet-text text-sm truncate group-hover:text-purple-500 transition-colors">
          {patientName}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-vet-muted mt-0.5">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{ownerName}</span>
          </div>
          {ownerContact && (
            <>
              <span className="text-vet-muted/50">•</span>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="text-[10px] text-vet-muted">{formatContact(ownerContact)}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Servicio y especificaciones */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full font-medium border border-purple-500/20">
            {service}
          </span>
          {specifications && (
            <span className="text-xs text-vet-muted truncate italic">
              "{specifications}"
            </span>
          )}
        </div>
      </div>
      
      {/* Hora */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20 flex-shrink-0 shadow-sm">
        <Clock className="w-3.5 h-3.5" />
        <span>{time}</span>
      </div>
    </div>
  );
}