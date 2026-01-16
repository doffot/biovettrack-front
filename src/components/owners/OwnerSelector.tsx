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
      <label className="block text-xs font-medium text-vet-text mb-1">
        Cliente {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected Owner Display */}
      {selectedOwner ? (
        <div className="bg-sky-soft border border-vet-border rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1 bg-vet-light rounded">
              <User className="w-3 h-3 text-vet-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-vet-text truncate">{selectedOwner.name}</p>
              {selectedOwner.phone && (
                <p className="text-[10px] text-vet-muted truncate">{selectedOwner.phone}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1 text-vet-muted hover:text-vet-danger hover:bg-vet-danger/10 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-2.5 py-2 bg-sky-soft border rounded-lg text-left flex items-center justify-between transition-colors text-xs ${
              error 
                ? "border-red-500 focus:ring-2 focus:ring-red-500/20" 
                : "border-vet-border hover:border-vet-primary focus:outline-none focus:ring-2 focus:ring-vet-primary/20"
            }`}
          >
            <span className={error ? "text-red-500" : "text-vet-muted"}>
              {error || "Seleccionar cliente..."}
            </span>
            <ChevronDown className={`w-3 h-3 text-vet-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-sky-soft border border-vet-border rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search & Create Button */}
              <div className="p-2 border-b border-vet-border space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-vet-muted" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 bg-vet-light border border-vet-border text-vet-text placeholder-vet-muted rounded text-xs focus:outline-none focus:ring-1 focus:ring-vet-primary/20 focus:border-vet-primary"
                    autoFocus
                  />
                </div>
                
                {/* Botón Crear Nuevo Cliente */}
                <button
                  type="button"
                  onClick={handleCreateOwner}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-vet-primary hover:bg-vet-secondary text-white rounded text-xs font-medium transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  Crear Nuevo Cliente
                </button>
              </div>

              {/* Owners List */}
              <div className="max-h-56 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center">
                    <div className="w-5 h-5 mx-auto border-2 border-vet-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-vet-muted mt-1">Cargando...</p>
                  </div>
                ) : filteredOwners.length > 0 ? (
                  <div className="divide-y divide-vet-border">
                    {filteredOwners.map((owner: Owner) => (
                      <button
                        key={owner._id}
                        type="button"
                        onClick={() => handleSelectOwner(owner)}
                        className="w-full p-2 text-left hover:bg-vet-hover transition-colors flex items-center gap-2"
                      >
                        <div className="p-1 bg-vet-light rounded flex-shrink-0">
                          <User className="w-3 h-3 text-vet-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-vet-text truncate">{owner.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-vet-muted mt-0.5">
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
                  <div className="p-4 text-center">
                    <User className="w-8 h-8 mx-auto text-vet-muted/30 mb-2" />
                    <p className="text-xs text-vet-muted mb-2">
                      {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateOwner}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-vet-primary hover:bg-vet-secondary text-white rounded text-xs font-medium transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
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
        <p className="mt-1 text-[10px] text-red-500">{error}</p>
      )}
    </div>
  );
}