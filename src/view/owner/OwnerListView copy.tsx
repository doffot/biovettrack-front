import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteOwners, getOwners } from "../../api/OwnerAPI";
import BackButton from "../../components/BackButton";
import { Eye, Edit, Trash2, User, Phone, Plus, Search } from "lucide-react";
import { toast } from "../../components/Toast";

export default function OwnerListView() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const queryclient = useQueryClient();

    const { mutate } = useMutation({
      mutationFn: deleteOwners,
      onError: (error) => {
        toast.error(error.message);
        
      },
      onSuccess: (data) => {
        toast.success(data.msg);
        queryclient.invalidateQueries({ queryKey: ["owners"] });
     
      },
    });

  const filteredOwners = data?.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.contact.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center mt-60">
        <div className="animate-pulse-soft">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-primary mt-4 text-center">Cargando...</p>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        {/* Header */}
        <div className="mt-60 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <BackButton label="volver" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white title-shine">
                Lista de Dueños
              </h1>
              
              <Link
                to="/owners/new"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-background px-4 py-3 rounded-xl font-semibold shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Nuevo Dueño
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por nombre o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/60 backdrop-blur-sm border border-muted/20 rounded-xl text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {filteredOwners.length ? (
              <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-muted/20 overflow-hidden shadow-premium">
                {/* Mobile/Tablet Headers */}
                <div className="bg-primary/5 px-4 py-3 border-b border-muted/10 block sm:block lg:block">
                  <div className="grid grid-cols-12 gap-2 items-center text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">
                    <div className="col-span-4 sm:col-span-4">Nombre</div>
                    <div className="col-span-3 sm:col-span-3">Contacto</div>
                    <div className="col-span-5 sm:col-span-5 text-center">Acciones</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-muted/10">
                  {filteredOwners.map((owner, index) => (
                    <div
                      key={owner._id}
                      className="tile-entrance px-4 py-4 hover:bg-primary/5 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Name */}
                        <div className="col-span-4 sm:col-span-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <Link to={`/owners/${owner._id}`} className="font-semibold text-white text-sm truncate group-hover:text-primary transition-colors duration-300">
                            {owner.name}
                          </Link>
                        </div>

                        {/* Contact */}
                        <div className="col-span-3 sm:col-span-3 flex items-center gap-1 text-text">
                          <Phone className="w-3 h-3 text-muted flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{owner.contact}</span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-5 sm:col-span-5 flex items-center justify-center gap-1">
                          <Link
                            to={`/owners/${owner._id}`}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 transform hover:scale-110">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/owners/${owner._id}/edit`}
                            className="p-2 text-muted hover:bg-muted/10 rounded-lg transition-all duration-200 transform hover:scale-110">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                          type="button"
                            onClick={() => mutate(owner._id)}
                            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-all duration-200 transform hover:scale-110">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-muted/20 p-8 max-w-sm mx-auto shadow-premium">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted animate-float" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-text mb-3">
                    {searchTerm ? "Sin resultados" : "No hay dueños"}
                  </h3>
                  
                  <p className="text-muted text-sm mb-6">
                    {searchTerm 
                      ? `No hay coincidencias para "${searchTerm}"`
                      : "Agrega el primer dueño"
                    }
                  </p>
                  
                  {!searchTerm && (
                    <Link
                      to="/owners/new"
                      className="inline-flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Dueño
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}