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
  const actionsRef = useRef<HTMLDivElement>(null); // Ahora en el perfil
  const paymentRef = useRef<HTMLDivElement>(null);
  const paymentButtonRef = useRef<HTMLButtonElement>(null);

  const hasPets = patients.length > 0;
  const hasAppointments = appointments.length > 0;
  const hasGrooming = groomingServices.length > 0;
  const hasInvoices = pendingInvoices.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (petsRef.current && !petsRef.current.contains(event.target as Node)) setShowPetsDropdown(false);
      if (appointmentsRef.current && !appointmentsRef.current.contains(event.target as Node)) setShowAppointmentsDropdown(false);
      if (groomingRef.current && !groomingRef.current.contains(event.target as Node)) setShowGroomingDropdown(false);
      if (invoicesRef.current && !invoicesRef.current.contains(event.target as Node)) setShowInvoicesDropdown(false);
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) setShowActionsMenu(false);
      if (paymentRef.current && !paymentRef.current.contains(event.target as Node)) setShowPaymentDropdown(false);
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
    return name.split(" ").map((part) => part.charAt(0)).join("").toUpperCase().slice(0, 2);
  };
  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };
  const formatDateShort = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
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
    if (!service.patientId || typeof service.patientId === "string") return "Mascota";
    return service.patientId.name || "Mascota";
  };
  const getPatientId = (service: GroomingService): string => {
    if (!service.patientId) return "";
    if (typeof service.patientId === "string") return service.patientId;
    return service.patientId._id || "";
  };

  // --- COMPONENTE PORTAL (REDISEÑO VISUAL) ---
  const PaymentDropdown = () => {
    if (!showPaymentDropdown) return null;
    return createPortal(
      <div
        className="fixed z-[9999] animate-in fade-in slide-in-from-top-2"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${Math.max(dropdownPosition.width, 320)}px`,
        }}
      >
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3">
            <p className="text-sm font-bold text-white">Facturas Pendientes</p>
            <p className="text-xs text-white/80">Selecciona una para procesar pago</p>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {pendingInvoices.map((invoice) => {
              const pending = getInvoicePending(invoice);
              const isParcial = invoice.paymentStatus === "Parcial";
              return (
                <button
                  key={invoice._id}
                  onClick={() => { setShowPaymentDropdown(false); onPayInvoice(invoice); }}
                  className="w-full text-left px-4 py-3 hover:bg-hover transition-colors border-b border-border last:border-0 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isParcial ? "bg-blue-500/10" : "bg-amber-500/10"}`}>
                      <FileText className={`w-5 h-5 ${isParcial ? "text-blue-500" : "text-amber-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-vet-text text-sm truncate group-hover:text-amber-500 transition-colors">{getInvoiceDescription(invoice)}</p>
                      <p className="text-[10px] text-vet-muted font-bold uppercase tracking-tighter">
                        {formatDateShort(invoice.date)} {isParcial && <span className="text-blue-500 ml-2">• ABONO PARCIAL</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${isParcial ? "text-blue-500" : "text-amber-500"}`}>${pending.toFixed(2)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {pendingInvoices.length > 1 && onOpenPayAll && (
            <div className="p-3 bg-hover/50 border-t border-border">
              <button
                onClick={() => { setShowPaymentDropdown(false); onOpenPayAll(); }}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs uppercase">Pagar Todo</span>
                </div>
                <p className="text-lg font-black">${totalPending.toFixed(2)}</p>
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="mt-3 lg:mt-0 transition-colors duration-300">
      {/* 
        Barra Superior de Navegación y Dropdowns 
        NOTA: z-50 para que quede POR ENCIMA de todo
      */}
      <div className="relative z-50 bg-card/60 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 text-vet-muted hover:text-vet-text transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium hidden lg:inline">Volver</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dropdown: Mascotas */}
              <div className="relative" ref={petsRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); if (hasPets) setShowPetsDropdown(true); }}
                  className="relative p-2.5 rounded-xl bg-hover/50 border border-border text-vet-muted hover:text-vet-accent hover:border-vet-accent/30 transition-all"
                >
                  <PawPrint className="w-5 h-5" />
                  {hasPets && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-vet-accent text-white rounded-full border-2 border-card">{patients.length}</span>}
                </button>
                {showPetsDropdown && hasPets && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-card z-50 overflow-hidden animate-in zoom-in-95">
                    <div className="bg-gradient-to-r from-vet-primary to-vet-accent px-4 py-3 text-white">
                      <p className="text-xs font-black uppercase tracking-widest opacity-80">Mascotas</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {patients.map((pet) => (
                        <Link key={pet._id} to={`/patients/${pet._id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-hover border-b border-border last:border-0" onClick={() => setShowPetsDropdown(false)}>
                          {pet.photo ? <img src={pet.photo} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-vet-light flex items-center justify-center"><PawPrint className="w-5 h-5 text-vet-accent" /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-vet-text text-sm">{pet.name}</p>
                            <p className="text-[10px] text-vet-muted uppercase">{pet.species} {pet.breed}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-vet-muted" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown: Citas */}
              <div className="relative" ref={appointmentsRef}>
                <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); if (hasAppointments) setShowAppointmentsDropdown(true); }} className="relative p-2.5 rounded-xl bg-hover/50 border border-border text-vet-muted hover:text-blue-500 hover:border-blue-500/30 transition-all">
                  <Calendar className="w-5 h-5" />
                  {hasAppointments && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-blue-500 text-white rounded-full border-2 border-card">{appointments.length}</span>}
                </button>
                {showAppointmentsDropdown && hasAppointments && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-card z-50 overflow-hidden animate-in zoom-in-95">
                    <div className="bg-blue-600 px-4 py-3 text-white"><p className="text-xs font-black uppercase tracking-widest">Citas Activas</p></div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {appointments.map((appt) => (
                        <Link key={appt._id} to={`/patients/${appt.patient._id}/appointments/${appt._id}`} className="block px-4 py-3 hover:bg-hover border-b border-border last:border-0" onClick={() => setShowAppointmentsDropdown(false)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><Calendar className="w-5 h-5" /></div>
                            <div className="flex-1"><p className="text-sm font-bold text-vet-text uppercase">{appt.type}</p><p className="text-[10px] text-vet-muted">{appt.patient.name} • {formatDate(appt.date)}</p></div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown: Estética */}
              <div className="relative" ref={groomingRef}>
                <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); if (hasGrooming) setShowGroomingDropdown(true); }} className="relative p-2.5 rounded-xl bg-hover/50 border border-border text-vet-muted hover:text-purple-500 hover:border-purple-500/30 transition-all">
                  <Scissors className="w-5 h-5" />
                  {hasGrooming && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-purple-500 text-white rounded-full border-2 border-card">{groomingServices.length}</span>}
                </button>
                {showGroomingDropdown && hasGrooming && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-card z-50 overflow-hidden animate-in zoom-in-95">
                    <div className="bg-purple-600 px-4 py-3 text-white"><p className="text-xs font-black uppercase tracking-widest">Servicios Estética</p></div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {groomingServices.map((service) => (
                        <Link key={service._id} to={`/patients/${getPatientId(service)}/grooming-services/${service._id}`} className="block px-4 py-3 hover:bg-hover border-b border-border" onClick={() => setShowGroomingDropdown(false)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Scissors className="w-5 h-5" /></div>
                            <div className="flex-1"><p className="text-sm font-bold text-vet-text">{service.service}</p><p className="text-[10px] text-vet-muted">{getPatientName(service)} • {formatDate(service.date)}</p></div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown: Facturas */}
              <div className="relative" ref={invoicesRef}>
                <button onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); if (hasInvoices) setShowInvoicesDropdown(true); }} className="relative p-2.5 rounded-xl bg-hover/50 border border-border text-vet-muted hover:text-amber-500 hover:border-amber-500/30 transition-all">
                  <FileText className="w-5 h-5" />
                  {hasInvoices && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-vet-danger text-white rounded-full border-2 border-card">{pendingInvoices.length}</span>}
                </button>
                {showInvoicesDropdown && hasInvoices && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-card z-50 overflow-hidden animate-in zoom-in-95">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-white flex justify-between items-center">
                      <p className="text-xs font-black uppercase tracking-widest">Pendientes</p>
                      <p className="text-sm font-black">${totalPending.toFixed(2)}</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {pendingInvoices.map((inv) => (
                        <button key={inv._id} onClick={() => { setShowInvoicesDropdown(false); onPayInvoice(inv); }} className="w-full text-left px-4 py-3 hover:bg-hover border-b border-border last:border-0 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.paymentStatus === 'Parcial' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}><FileText className="w-5 h-5" /></div>
                          <div className="flex-1"><p className="text-xs font-bold text-vet-text truncate">{getInvoiceDescription(inv)}</p><p className="text-[10px] text-vet-muted">{formatDateShort(inv.date)}</p></div>
                          <p className={`text-sm font-black ${inv.paymentStatus === 'Parcial' ? 'text-blue-500' : 'text-amber-500'}`}>${getInvoicePending(inv).toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Perfil Propietario (z-10 para estar debajo de los dropdowns) */}
      <div className="relative z-10 bg-card/40 backdrop-blur-sm border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Parte Izquierda: Foto y Datos */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-vet-primary to-vet-accent flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-vet-primary/20 ring-4 ring-card">
                {getInitials(owner.name)}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-vet-text tracking-tight">{owner.name}</h1>
                <div className="flex items-center gap-3 text-vet-muted text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {owner.nationalId || "Sin Cédula"}</span>
                </div>
              </div>
            </div>

            {/* Parte Derecha: Info contacto y Acciones */}
            <div className="flex items-center gap-6">
              {/* Info de contacto */}
              <div className="hidden xl:grid grid-cols-2 gap-4 text-sm border-r border-border pr-6">
                {owner.contact && <a href={`https://wa.me/${owner.contact.replace(/\D/g, "")}`} className="flex items-center gap-2 text-vet-muted hover:text-emerald-500 transition-colors"><Phone className="w-4 h-4" /> {owner.contact}</a>}
                {owner.email && <div className="flex items-center gap-2 text-vet-muted"><Mail className="w-4 h-4" /> <span className="truncate max-w-[150px]">{owner.email}</span></div>}
              </div>

              {/* Menú de Acciones MOVIDO AQUÍ */}
              <div className="relative" ref={actionsRef}>
                <button 
                  onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowActionsMenu(!showActionsMenu); }} 
                  className="p-2.5 rounded-xl bg-hover/50 border border-border text-vet-muted hover:text-vet-text transition-all"
                  title="Más opciones"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showActionsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-card z-50 overflow-hidden animate-in slide-in-from-top-2">
                    <button onClick={() => { setShowActionsMenu(false); onEdit(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-vet-text hover:bg-hover transition-colors"><Edit className="w-4 h-4 text-blue-500" /> Editar Perfil</button>
                    <button onClick={() => { setShowActionsMenu(false); onDelete(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-vet-danger hover:bg-vet-danger/10 transition-colors border-t border-border"><Trash2 className="w-4 h-4" /> Eliminar Propietario</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Info contacto móvil/tablet (debajo) */}
          <div className="xl:hidden mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
             {owner.contact && <a href={`https://wa.me/${owner.contact.replace(/\D/g, "")}`} className="flex items-center gap-3 text-vet-muted hover:text-emerald-500 transition-colors"><div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500"><Phone className="w-3.5 h-3.5" /></div> {owner.contact}</a>}
             {owner.address && <div className="flex items-center gap-3 text-vet-muted"><div className="p-1.5 bg-vet-light rounded-lg text-vet-text"><MapPin className="w-3.5 h-3.5" /></div> {owner.address}</div>}
          </div>
        </div>
      </div>

      {/* Dashboard Financiero */}
      <div className="bg-vet-light border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {isLoadingFinancial ? (
            <div className="flex items-center justify-center py-8"><div className="w-8 h-8 border-4 border-vet-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Crédito a Favor */}
              <div className="col-span-2 lg:col-span-1 bg-card rounded-2xl p-5 border border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><Wallet className="w-4 h-4" /></div>
                  <span className="text-[10px] font-black text-vet-muted uppercase tracking-widest">Crédito</span>
                </div>
                <p className="text-3xl font-black text-emerald-500">${creditBalance.toFixed(2)}</p>
              </div>

              {/* Consumido */}
              <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-3 text-vet-muted">
                  <div className="p-2 bg-vet-light rounded-xl"><TrendingUp className="w-4 h-4" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Consumido</span>
                </div>
                <p className="text-2xl font-black text-vet-text">${totalConsumed.toFixed(2)}</p>
              </div>

              {/* Pagado */}
              <div className="bg-card rounded-2xl p-5 border border-blue-500/20 shadow-soft">
                <div className="flex items-center gap-2 mb-3 text-blue-500">
                  <div className="p-2 bg-blue-500/10 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Pagado</span>
                </div>
                <p className="text-2xl font-black text-blue-500">${totalPaid.toFixed(2)}</p>
              </div>

              {/* Pendiente */}
              <div className={`col-span-1 rounded-2xl p-5 border transition-all shadow-soft ${totalPending > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <div className={`p-2 rounded-xl ${totalPending > 0 ? 'bg-amber-500/10' : 'bg-vet-light'}`}><AlertCircle className="w-4 h-4" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Deuda</span>
                </div>
                <p className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-500' : 'text-vet-muted'}`}>${totalPending.toFixed(2)}</p>
              </div>

              {/* Botón Cobrar (Compacto) */}
              {totalPending > 0 && (
                <div className="col-span-2 lg:col-span-1 flex items-center" ref={paymentRef}>
                  <button
                    ref={paymentButtonRef}
                    onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowPaymentDropdown(true); }}
                    className="w-full py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-vet-accent to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-vet-accent/20 hover:-translate-y-0.5 transition-all text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>COBRAR</span>
                    <ChevronDown className="w-3 h-3 opacity-80" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PaymentDropdown />
    </div>
  );
}