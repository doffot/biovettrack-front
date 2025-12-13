// src/views/owners/OwnerListView.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  CreditCard,
  ChevronRight,
  UserPlus,
  X,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { getOwners, deleteOwners } from "../../api/OwnerAPI";
import { toast } from "../../components/Toast";
import type { Owner } from "../../types/owner";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function OwnerListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: owners = [], isLoading } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const { mutate: removeOwner, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteOwners(id),
    onSuccess: () => {
      toast.success("Propietario eliminado");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredOwners = owners.filter((owner) => {
    const search = searchTerm.toLowerCase();
    return (
      owner.name.toLowerCase().includes(search) ||
      owner.contact.includes(search) ||
      owner.email?.toLowerCase().includes(search) ||
      owner.nationalId?.toLowerCase().includes(search)
    );
  });

  const handleWhatsApp = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-3 border-vet-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-vet-muted text-sm">Cargando propietarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-vet-light/30">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-2xl shadow-lg shadow-vet-primary/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-vet-text">Propietarios</h1>
              <p className="text-sm text-vet-muted">
                {owners.length} cliente{owners.length !== 1 ? "s" : ""} registrado{owners.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          
          <Link
            to="/owners/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-vet-primary/25 hover:shadow-xl hover:shadow-vet-primary/30 hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Propietario
          </Link>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vet-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary shadow-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-vet-muted" />
              </button>
            )}
          </div>
          
          {searchTerm && (
            <p className="mt-2 text-xs text-vet-muted">
              {filteredOwners.length} resultado{filteredOwners.length !== 1 ? "s" : ""} para "{searchTerm}"
            </p>
          )}
        </div>

        {/* Lista de propietarios */}
        {filteredOwners.length > 0 ? (
          <div className={`space-y-3 transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            {filteredOwners.map((owner, index) => (
              <OwnerCard
                key={owner._id}
                owner={owner}
                index={index}
                onNavigate={() => navigate(`/owners/${owner._id}`)}
                onWhatsApp={(e) => handleWhatsApp(e, owner.contact)}
                onDelete={(e) => {
                  e.stopPropagation();
                  setOwnerToDelete(owner);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            hasSearch={!!searchTerm} 
            onClearSearch={() => setSearchTerm("")}
          />
        )}
      </div>

      {/* Modal Eliminar */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        onConfirm={() => ownerToDelete?._id && removeOwner(ownerToDelete._id)}
        petName={`al propietario ${ownerToDelete?.name || ""}`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// ============ COMPONENTE OWNER CARD ============
interface OwnerCardProps {
  owner: Owner;
  index: number;
  onNavigate: () => void;
  onWhatsApp: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function OwnerCard({ owner, index, onNavigate, onWhatsApp, onDelete }: OwnerCardProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-emerald-500 to-emerald-600",
      "from-amber-500 to-amber-600",
      "from-rose-500 to-rose-600",
      "from-cyan-500 to-cyan-600",
      "from-indigo-500 to-indigo-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onNavigate}
      className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:shadow-gray-100/50 hover:border-vet-primary/20 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarColor(owner.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
          {getInitials(owner.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
          {/* Nombre y teléfono */}
          <div className="sm:col-span-4 min-w-0">
            <h3 className="font-semibold text-vet-text truncate group-hover:text-vet-primary transition-colors">
              {owner.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-vet-muted mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span className="truncate">{owner.contact}</span>
            </div>
          </div>

          {/* Cédula */}
          <div className="hidden sm:flex sm:col-span-3 items-center gap-2 min-w-0">
            {owner.nationalId ? (
              <>
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span className="text-sm text-vet-text truncate">{owner.nationalId}</span>
              </>
            ) : (
              <span className="text-sm text-gray-300">—</span>
            )}
          </div>

          {/* Email */}
          <div className="hidden md:flex md:col-span-4 items-center gap-2 min-w-0">
            {owner.email ? (
              <>
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-sm text-vet-text truncate">{owner.email}</span>
              </>
            ) : (
              <span className="text-sm text-gray-300">Sin email</span>
            )}
          </div>

          {/* Info móvil */}
          <div className="flex sm:hidden items-center gap-3 text-xs text-vet-muted">
            {owner.nationalId && (
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {owner.nationalId}
              </span>
            )}
            {owner.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" />
                {owner.email}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* WhatsApp */}
          <button
            onClick={onWhatsApp}
            className="p-2.5 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100"
            title="Enviar WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          {/* Eliminar */}
          <button
            onClick={onDelete}
            className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Arrow */}
          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-vet-primary/10 transition-all ml-1">
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-vet-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ EMPTY STATE ============
interface EmptyStateProps {
  hasSearch: boolean;
  onClearSearch: () => void;
}

function EmptyState({ hasSearch, onClearSearch }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-vet-light to-gray-100 rounded-2xl flex items-center justify-center">
          <Users className="w-10 h-10 text-vet-muted" />
        </div>
        {!hasSearch && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-vet-primary rounded-xl flex items-center justify-center shadow-lg">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-vet-text mb-2">
        {hasSearch ? "Sin resultados" : "Sin propietarios"}
      </h3>
      <p className="text-sm text-vet-muted mb-6 max-w-sm mx-auto">
        {hasSearch
          ? "No encontramos propietarios con esos criterios de búsqueda"
          : "Registra tu primer cliente para comenzar a gestionar sus mascotas"
        }
      </p>

      {hasSearch ? (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-vet-primary hover:bg-vet-light rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
          Limpiar búsqueda
        </button>
      ) : (
        <Link
          to="/owners/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vet-primary to-vet-secondary text-white text-sm font-semibold rounded-xl shadow-lg shadow-vet-primary/25 hover:shadow-xl hover:scale-105 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Propietario
        </Link>
      )}
    </div>
  );
}