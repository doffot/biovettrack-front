// src/components/sales/ClientSelectModal.tsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Search,
  User,
  UserPlus,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { getOwners, createOwner } from "../../api/OwnerAPI";
import { toast } from "../Toast";
import type { Owner, OwnerFormData } from "../../types/owner";

type SelectedClient = {
  id: string;
  name: string;
  phone?: string;
  creditBalance?: number;
} | null;

interface ClientSelectModalProps {
  isOpen: boolean;
  onSelect: (client: SelectedClient) => void;
  onSkip: () => void;
}

export function ClientSelectModal({ isOpen, onSelect, onSkip }: ClientSelectModalProps) {
  const queryClient = useQueryClient();
  
  const [view, setView] = useState<"select" | "create">("select");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<OwnerFormData>({
    name: "",
    contact: "",
    email: "",
    address: "",
    nationalId: "",
  });

  // Query clientes
  const { data: owners = [], isLoading } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
    enabled: isOpen,
  });

  // Mutation crear cliente
  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createOwner,
    onSuccess: (data) => {
      toast.success("Cliente creado");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      onSelect({
        id: data.owner._id,
        name: data.owner.name,
        phone: data.owner.contact,
        creditBalance: data.owner.creditBalance || 0,
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Filtrar clientes
  const filteredOwners = search.trim()
    ? owners.filter(
        (o: Owner) =>
          o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.contact?.includes(search) ||
          o.nationalId?.toLowerCase().includes(search.toLowerCase())
      )
    : owners.slice(0, 10);

  const handleSelectOwner = (owner: Owner) => {
    onSelect({
      id: owner._id,
      name: owner.name,
      phone: owner.contact,
      creditBalance: owner.creditBalance || 0,
    });
    resetForm();
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!formData.contact.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }

    createMutation(formData);
  };

  const handleSkip = () => {
    resetForm();
    onSkip();
  };

  const resetForm = () => {
    setSearch("");
    setView("select");
    setFormData({
      name: "",
      contact: "",
      email: "",
      address: "",
      nationalId: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleSkip} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-vet-primary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view === "create" && (
                <button
                  onClick={() => setView("select")}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {view === "select" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <UserPlus className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {view === "select" ? "Seleccionar Cliente" : "Nuevo Cliente"}
                </h2>
                <p className="text-white/80 text-sm">
                  {view === "select" ? "¿Quién realiza la compra?" : "Ingresa los datos"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        {view === "select" ? (
          <div className="p-4">
            {/* Buscador */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                autoFocus
              />
            </div>

            {/* Lista de clientes */}
            <div className="max-h-[240px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-vet-primary mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                </div>
              ) : filteredOwners.length === 0 ? (
                <div className="py-8 text-center">
                  <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {search ? "No se encontraron clientes" : "No hay clientes registrados"}
                  </p>
                </div>
              ) : (
                filteredOwners.map((owner: Owner) => (
                  <button
                    key={owner._id}
                    onClick={() => handleSelectOwner(owner)}
                    className="w-full p-3 text-left rounded-xl border border-gray-200 hover:border-vet-primary hover:bg-vet-light transition-all flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-vet-light flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-vet-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-vet-text truncate">{owner.name}</p>
                      <p className="text-xs text-gray-500 truncate">{owner.contact}</p>
                    </div>
                    {(owner.creditBalance || 0) > 0 && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        ${owner.creditBalance?.toFixed(2)}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Acciones */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setView("create")}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-vet-primary font-medium rounded-xl border-2 border-dashed border-vet-primary/30 hover:border-vet-primary hover:bg-vet-light transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Crear nuevo cliente
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Continuar sin cliente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateOwner} className="p-4 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-vet-text mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                autoFocus
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-vet-text mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="0412-1234567"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            {/* Email (opcional) */}
            <div>
              <label className="block text-sm font-medium text-vet-text mb-1">
                Email <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                />
              </div>
            </div>

            {/* Cédula (opcional) */}
            <div>
              <label className="block text-sm font-medium text-vet-text mb-1">
                Cédula <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.nationalId || ""}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="V-12345678"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setView("select")}
                className="flex-1 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear y seleccionar"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}