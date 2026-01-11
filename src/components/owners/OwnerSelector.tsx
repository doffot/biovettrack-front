// src/components/owner/OwnerSelector.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, User, X, ChevronDown, UserPlus } from "lucide-react";
import type { Owner } from "../../types/owner";
import { getOwners } from "../../api/OwnerAPI";

interface OwnerSelectorProps {
  selectedOwner: { id: string; name: string; phone?: string } | null;
  onSelectOwner: (owner: { id: string; name: string; phone?: string } | null) => void;
  required?: boolean;
  error?: string;
}

export function OwnerSelector({ 
  selectedOwner, 
  onSelectOwner, 
  required = false,
  error 
}: OwnerSelectorProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar owners
  const { data: owners = [], isLoading } = useQuery<Owner[]>({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  // Filtrar owners por búsqueda
  const filteredOwners = useMemo(() => {
    if (!searchTerm.trim()) return owners;
    
    const search = searchTerm.toLowerCase();
    return owners.filter((owner: Owner) => 
      owner.name.toLowerCase().includes(search) ||
      owner.contact?.toLowerCase().includes(search) ||
      owner.nationalId?.toLowerCase().includes(search)
    );
  }, [owners, searchTerm]);

  // Seleccionar owner
  const handleSelectOwner = (owner: Owner) => {
    onSelectOwner({
      id: owner._id,
      name: owner.name,
      phone: owner.contact,
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  // Limpiar selección
  const handleClearSelection = () => {
    onSelectOwner(null);
    setSearchTerm("");
  };

  // Navegar a crear owner
  const handleCreateOwner = () => {
    navigate("/owners/create");
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".owner-selector-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="owner-selector-container relative">
      <label className="block text-sm font-medium text-vet-text mb-2">
        Cliente {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected Owner Display */}
      {selectedOwner ? (
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-vet-light rounded-lg">
              <User className="w-5 h-5 text-vet-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-vet-text truncate">{selectedOwner.name}</p>
              {selectedOwner.phone && (
                <p className="text-sm text-vet-muted truncate">{selectedOwner.phone}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 bg-white border rounded-lg text-left flex items-center justify-between transition-colors ${
              error 
                ? "border-red-300 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 hover:border-vet-primary focus:outline-none focus:ring-2 focus:ring-vet-primary/20"
            }`}
          >
            <span className={error ? "text-red-500" : "text-gray-400"}>
              {error || "Seleccionar cliente..."}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search & Create Button */}
              <div className="p-3 border-b border-gray-200 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, contacto o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
                    autoFocus
                  />
                </div>
                
                {/* Botón Crear Nuevo Cliente */}
                <button
                  type="button"
                  onClick={handleCreateOwner}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-vet-primary hover:bg-vet-secondary text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Crear Nuevo Cliente
                </button>
              </div>

              {/* Owners List */}
              <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="w-6 h-6 mx-auto border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-vet-muted mt-2">Cargando clientes...</p>
                  </div>
                ) : filteredOwners.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredOwners.map((owner: Owner) => (
                      <button
                        key={owner._id}
                        type="button"
                        onClick={() => handleSelectOwner(owner)}
                        className="w-full p-3 text-left hover:bg-vet-light/50 transition-colors flex items-center gap-3"
                      >
                        <div className="p-2 bg-vet-light rounded-lg">
                          <User className="w-4 h-4 text-vet-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-vet-text truncate">{owner.name}</p>
                          <div className="flex items-center gap-2 text-xs text-vet-muted mt-0.5">
                            <span className="truncate">{owner.contact}</span>
                            {owner.nationalId && (
                              <>
                                <span>•</span>
                                <span>{owner.nationalId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-vet-muted mb-3">
                      {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateOwner}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-vet-primary hover:bg-vet-secondary text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Crear Primer Cliente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && !selectedOwner && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}