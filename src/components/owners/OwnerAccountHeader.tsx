// src/components/owners/OwnerAccountHeader.tsx
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  PawPrint,
  Calendar,
  FileText,
  Scissors,
  ChevronRight,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import type { Owner } from "../../types/owner";
import type { Patient } from "../../types/patient";
import type { Invoice } from "../../types/invoice";
import type { GroomingService } from "../../types/grooming";

interface Appointment {
  _id: string;
  type: string;
  date: string;
  patient: {
    _id: string;
    name: string;
    species?: string;
    photo?: string;
  };
}

interface OwnerAccountHeaderProps {
  owner: Owner;
  creditBalance: number;
  totalConsumed: number;
  totalPaid: number;
  totalPending: number;
  pendingInvoices: Invoice[];
  patients: Patient[];
  appointments: Appointment[];
  groomingServices: GroomingService[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPayInvoice: (invoice: Invoice) => void;
  onOpenPayAll?: () => void;
  isLoadingFinancial?: boolean;
}

export function OwnerAccountHeader({
  owner,
  creditBalance,
  totalConsumed,
  totalPaid,
  totalPending,
  pendingInvoices,
  patients,
  appointments,
  groomingServices,
  onBack,
  onEdit,
  onDelete,
  onPayInvoice,
  onOpenPayAll,
  isLoadingFinancial,
}: OwnerAccountHeaderProps) {
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  const [showAppointmentsDropdown, setShowAppointmentsDropdown] = useState(false);
  const [showGroomingDropdown, setShowGroomingDropdown] = useState(false);
  const [showInvoicesDropdown, setShowInvoicesDropdown] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const petsRef = useRef<HTMLDivElement>(null);
  const appointmentsRef = useRef<HTMLDivElement>(null);
  const groomingRef = useRef<HTMLDivElement>(null);
  const invoicesRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const paymentButtonRef = useRef<HTMLButtonElement>(null);

  const hasPets = patients.length > 0;
  const hasAppointments = appointments.length > 0;
  const hasGrooming = groomingServices.length > 0;
  const hasInvoices = pendingInvoices.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (petsRef.current && !petsRef.current.contains(event.target as Node)) {
        setShowPetsDropdown(false);
      }
      if (appointmentsRef.current && !appointmentsRef.current.contains(event.target as Node)) {
        setShowAppointmentsDropdown(false);
      }
      if (groomingRef.current && !groomingRef.current.contains(event.target as Node)) {
        setShowGroomingDropdown(false);
      }
      if (invoicesRef.current && !invoicesRef.current.contains(event.target as Node)) {
        setShowInvoicesDropdown(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
      if (paymentRef.current && !paymentRef.current.contains(event.target as Node)) {
        setShowPaymentDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showPaymentDropdown && paymentButtonRef.current) {
      const rect = paymentButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showPaymentDropdown]);

  const closeAllDropdowns = () => {
    setShowPetsDropdown(false);
    setShowAppointmentsDropdown(false);
    setShowGroomingDropdown(false);
    setShowInvoicesDropdown(false);
    setShowActionsMenu(false);
    setShowPaymentDropdown(false);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const getInvoiceDescription = (invoice: Invoice): string => {
    if (!invoice.items || invoice.items.length === 0) return "Factura";
    const descriptions = invoice.items.map((i) => i.description);
    if (descriptions.length <= 2) return descriptions.join(", ");
    return `${descriptions.slice(0, 2).join(", ")} +${descriptions.length - 2}`;
  };

  const getInvoicePending = (invoice: Invoice): number => {
    return invoice.total - (invoice.amountPaid || 0);
  };

  const getPatientName = (service: GroomingService): string => {
    if (!service.patientId) return "Mascota";
    if (typeof service.patientId === "string") return "Mascota";
    return service.patientId.name || "Mascota";
  };

  const getPatientId = (service: GroomingService): string => {
    if (!service.patientId) return "";
    if (typeof service.patientId === "string") return service.patientId;
    return service.patientId._id || "";
  };

  // Componente del dropdown con portal
  const PaymentDropdown = () => {
    if (!showPaymentDropdown) return null;

    const dropdownContent = (
      <div
        className="fixed z-[9999] animate-fade-in"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${Math.max(dropdownPosition.width, 320)}px`,
        }}
      >
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-vet-primary to-vet-accent px-4 py-3">
            <p className="text-sm font-bold text-white">Opciones de Pago</p>
            <p className="text-xs text-white/80">Selecciona una factura o paga todo</p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {pendingInvoices.map((invoice) => {
              const pending = getInvoicePending(invoice);
              const isParcial = invoice.paymentStatus === "Parcial";

              return (
                <button
                  key={invoice._id}
                  onClick={() => {
                    setShowPaymentDropdown(false);
                    onPayInvoice(invoice);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-vet-light transition-colors border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isParcial ? "bg-blue-100" : "bg-amber-100"}`}>
                      <FileText className={`w-5 h-5 ${isParcial ? "text-blue-600" : "text-amber-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {getInvoiceDescription(invoice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateShort(invoice.date)}
                        {isParcial && (
                          <span className="ml-2 text-blue-600 font-medium">Parcial</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isParcial ? "text-blue-600" : "text-amber-600"}`}>
                        ${pending.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t-2 border-gray-200" />

          {pendingInvoices.length > 1 && onOpenPayAll && (
            <div className="p-3 bg-gradient-to-br from-emerald-50 to-vet-light">
              <button
                onClick={() => {
                  setShowPaymentDropdown(false);
                  onOpenPayAll();
                }}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm leading-tight">Pagar Todo</p>
                    <p className="text-xs opacity-90">{pendingInvoices.length} facturas</p>
                  </div>
                </div>
                <p className="text-lg font-bold">${totalPending.toFixed(2)}</p>
              </button>
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className="mt-3 lg:mt-0">
      {/* Barra superior */}
      <div className="bg-vet-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Lado izquierdo: Botón volver + título en móvil/tablet */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/80 hover:text-vet-accent transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:inline">Propietarios</span>
              </button>
              
              {/* Título en móvil y tablet */}
              <span className="text-white font-medium text-sm lg:hidden">Propietario</span>
            </div>

            {/* Lado derecho: Indicadores + Acciones */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Indicador: Mascotas */}
              <div className="relative" ref={petsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    if (hasPets) setShowPetsDropdown(true);
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 group"
                >
                  <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" />
                  {hasPets && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold text-white bg-vet-accent rounded-full border-2 border-vet-secondary shadow-sm">
                      {patients.length}
                    </span>
                  )}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 hidden lg:block">
                    Mascotas
                  </span>
                </button>

                {showPetsDropdown && hasPets && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-vet-primary to-vet-secondary px-4 py-3">
                      <p className="text-sm font-bold text-white">Mascotas</p>
                      <p className="text-xs text-white/80">{patients.length} registrada{patients.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {patients.map((pet) => (
                        <Link
                          key={pet._id}
                          to={`/patients/${pet._id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-vet-light transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => setShowPetsDropdown(false)}
                        >
                          {pet.photo ? (
                            <img src={pet.photo} alt={pet.name} className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-vet-light flex items-center justify-center">
                              <PawPrint className="w-5 h-5 text-vet-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{pet.name}</p>
                            <p className="text-xs text-gray-500">{pet.species} {pet.breed ? `• ${pet.breed}` : ""}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Indicador: Citas */}
              <div className="relative" ref={appointmentsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    if (hasAppointments) setShowAppointmentsDropdown(true);
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 group"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  {hasAppointments && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold text-white bg-vet-accent rounded-full border-2 border-vet-secondary shadow-sm">
                      {appointments.length}
                    </span>
                  )}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 hidden lg:block">
                    Citas
                  </span>
                </button>

                {showAppointmentsDropdown && hasAppointments && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-vet-primary to-vet-secondary px-4 py-3">
                      <p className="text-sm font-bold text-white">Citas Activas</p>
                      <p className="text-xs text-white/80">{appointments.length} programada{appointments.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {appointments.map((appt) => (
                        <Link
                          key={appt._id}
                          to={`/patients/${appt.patient._id}/appointments/${appt._id}`}
                          className="block px-4 py-3 hover:bg-vet-light transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => setShowAppointmentsDropdown(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-vet-light flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-vet-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{appt.type}</p>
                              <p className="text-xs text-gray-500">{appt.patient.name} • {formatDate(appt.date)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Indicador: Servicios */}
              <div className="relative" ref={groomingRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    if (hasGrooming) setShowGroomingDropdown(true);
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 group"
                >
                  <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                  {hasGrooming && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold text-white bg-vet-accent rounded-full border-2 border-vet-secondary shadow-sm">
                      {groomingServices.length}
                    </span>
                  )}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 hidden lg:block">
                    Servicios Hoy
                  </span>
                </button>

                {showGroomingDropdown && hasGrooming && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-vet-primary to-vet-secondary px-4 py-3">
                      <p className="text-sm font-bold text-white">Servicios de Hoy</p>
                      <p className="text-xs text-white/80">{groomingServices.length} servicio{groomingServices.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {groomingServices.map((service) => (
                        <Link
                          key={service._id}
                          to={`/patients/${getPatientId(service)}/grooming-services/${service._id}`}
                          className="block px-4 py-3 hover:bg-vet-light transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => setShowGroomingDropdown(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-vet-light flex items-center justify-center">
                              <Scissors className="w-5 h-5 text-vet-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{service.service}</p>
                              <p className="text-xs text-gray-500">{getPatientName(service)} • {formatDate(service.date)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Indicador: Facturas */}
              <div className="relative" ref={invoicesRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    if (hasInvoices) setShowInvoicesDropdown(true);
                  }}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 group"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  {hasInvoices && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-vet-secondary shadow-sm">
                      {pendingInvoices.length}
                    </span>
                  )}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 hidden lg:block">
                    Facturas
                  </span>
                </button>

                {showInvoicesDropdown && hasInvoices && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
                      <p className="text-sm font-bold text-white">Facturas Pendientes</p>
                      <p className="text-xs text-white/80">
                        {pendingInvoices.length} factura{pendingInvoices.length !== 1 ? "s" : ""} • Total: ${totalPending.toFixed(2)}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {pendingInvoices.map((invoice) => {
                        const pending = getInvoicePending(invoice);
                        const isParcial = invoice.paymentStatus === "Parcial";

                        return (
                          <button
                            key={invoice._id}
                            onClick={() => {
                              console.log("🔴 CLICK en factura:", invoice);
                              setShowInvoicesDropdown(false);
                              onPayInvoice(invoice);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isParcial ? "bg-blue-100" : "bg-amber-100"}`}>
                                <FileText className={`w-5 h-5 ${isParcial ? "text-blue-600" : "text-amber-600"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {getInvoiceDescription(invoice)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDateShort(invoice.date)}
                                  {isParcial && (
                                    <span className="ml-2 text-blue-600 font-medium">Parcial</span>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${isParcial ? "text-blue-600" : "text-amber-600"}`}>
                                  ${pending.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-gray-400">Pendiente</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {pendingInvoices.length > 1 && onOpenPayAll && (
                      <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => {
                            setShowInvoicesDropdown(false);
                            onOpenPayAll();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-vet-primary to-vet-accent hover:from-vet-secondary hover:to-vet-primary text-white text-sm font-semibold rounded-xl transition-all"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pagar Todo (${totalPending.toFixed(2)})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Separador */}
              <div className="w-px h-6 bg-white/20 mx-0.5 sm:mx-1" />

              {/* Acciones - Desktop (solo lg+) */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-vet-accent transition-colors duration-200"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-white/80 hover:text-red-300 transition-colors duration-200"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Acciones - Mobile y Tablet (menú desplegable) */}
              <div className="relative lg:hidden" ref={actionsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAllDropdowns();
                    setShowActionsMenu(true);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showActionsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <button
                      onClick={() => {
                        setShowActionsMenu(false);
                        onEdit();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setShowActionsMenu(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info del propietario */}
      <div className="bg-white border-b-2 border-vet-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vet-primary to-vet-accent flex items-center justify-center text-white font-bold text-xl shadow-md">
                {getInitials(owner.name)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-vet-text">{owner.name}</h1>
                {owner.nationalId && (
                  <div className="flex items-center gap-1.5 text-vet-muted text-sm mt-0.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{owner.nationalId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block w-px h-12 bg-gray-200" />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {owner.contact && (
                <a
                  href={`https://wa.me/${owner.contact.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-vet-muted hover:text-vet-primary transition-colors duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>{owner.contact}</span>
                </a>
              )}
              {owner.email && (
                <a
                  href={`mailto:${owner.email}`}
                  className="flex items-center gap-2 text-vet-muted hover:text-vet-primary transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{owner.email}</span>
                </a>
              )}
              {owner.address && (
                <div className="flex items-center gap-2 text-vet-muted">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{owner.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-sky-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          {isLoadingFinancial ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="col-span-2 lg:col-span-1 bg-vet-light rounded-xl p-4 border border-vet-muted/20 hover:border-vet-primary hover:shadow-md transition-all duration-200 cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Wallet className="w-4 h-4 text-vet-primary" />
                  </div>
                  <span className="text-xs text-vet-muted uppercase tracking-wide font-semibold">Crédito</span>
                </div>
                <p className="text-2xl font-bold text-vet-primary">${creditBalance.toFixed(2)}</p>
              </div>

              <div className="bg-vet-light rounded-xl p-4 border border-vet-muted/20 hover:border-vet-primary hover:shadow-md transition-all duration-200 cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-vet-accent/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-vet-accent" />
                  </div>
                  <span className="text-xs text-vet-muted uppercase tracking-wide font-semibold">Consumido</span>
                </div>
                <p className="text-xl font-bold text-vet-text">${totalConsumed.toFixed(2)}</p>
              </div>

              <div className="bg-vet-light rounded-xl p-4 border border-vet-muted/20 hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs text-vet-muted uppercase tracking-wide font-semibold">Pagado</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-200 cursor-default ${
                totalPending > 0
                  ? "bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-md"
                  : "bg-vet-light border-vet-muted/20 hover:border-vet-primary hover:shadow-md"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${totalPending > 0 ? "bg-amber-100" : "bg-gray-100"}`}>
                    {totalPending > 0 ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-vet-muted" />
                    )}
                  </div>
                  <span className={`text-xs uppercase tracking-wide font-semibold ${totalPending > 0 ? "text-amber-700" : "text-vet-muted"}`}>
                    Pendiente
                  </span>
                </div>
                <p className={`text-xl font-bold ${totalPending > 0 ? "text-amber-600" : "text-vet-muted"}`}>
                  ${totalPending.toFixed(2)}
                </p>
                {pendingInvoices.length > 0 && (
                  <p className="text-xs text-amber-600/80 mt-1">{pendingInvoices.length} factura{pendingInvoices.length > 1 ? "s" : ""}</p>
                )}
              </div>

              {totalPending > 0 && (
                <div className="col-span-2 lg:col-span-1 flex items-center" ref={paymentRef}>
                  <button
                    ref={paymentButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAllDropdowns();
                      setShowPaymentDropdown(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-vet-primary to-vet-accent hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Pagar</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dropdown de pagos con portal */}
      <PaymentDropdown />
    </div>
  );
}