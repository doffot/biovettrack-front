// src/views/owners/OwnerListView.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { getOwners, deleteOwners } from "../../api/OwnerAPI";
import { toast } from "../../components/Toast";
import type { Owner } from "../../types/owner";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

export default function OwnerListView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);

   // ✅ Tipado explícito aquí
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

  // ✅ Ahora owner tiene tipo Owner
  const filteredOwners = owners.filter((owner) => {
    const search = searchTerm.toLowerCase();
    return (
      owner.name.toLowerCase().includes(search) ||
      owner.contact.includes(search) ||
      owner.email?.toLowerCase().includes(search) ||
      owner.nationalId?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propietarios</h1>
          <p className="text-sm text-gray-500">
            {owners.length} propietario{owners.length !== 1 ? "s" : ""} registrado
            {owners.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/owners/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Propietario
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
          />
        </div>
      </div>

      {/* Tabla */}
      {filteredOwners.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Tabla Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Propietario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Teléfono
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Cédula
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Dirección
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOwners.map((owner) => (
                  <tr
                    key={owner._id}
                    onClick={() => navigate(`/owners/${owner._id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {owner.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {owner.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {owner.contact}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {owner.email ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[180px]">{owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {owner.nationalId ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {owner.nationalId}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {owner.address ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{owner.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/owners/${owner._id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-vet-primary hover:bg-vet-primary/10 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/owners/${owner._id}/edit`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setOwnerToDelete(owner);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista Mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredOwners.map((owner) => (
              <div
                key={owner._id}
                onClick={() => navigate(`/owners/${owner._id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vet-primary to-vet-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                      {owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {owner.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                        {owner.contact}
                      </div>
                      {owner.nationalId && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <CreditCard className="w-3 h-3" />
                          {owner.nationalId}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                {/* Acciones móvil */}
                <div
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/owners/${owner._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-vet-primary hover:bg-vet-primary/5 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => navigate(`/owners/${owner._id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setOwnerToDelete(owner);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No se encontraron propietarios"
              : "Sin propietarios registrados"}
          </p>
          {!searchTerm && (
            <Link
              to="/owners/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary text-white text-sm font-medium rounded-lg hover:bg-vet-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar primer propietario
            </Link>
          )}
        </div>
      )}

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