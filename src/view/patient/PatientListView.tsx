import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getOwners } from "../../api/OwnerAPI";
import {
  Eye,
  Edit,
  Trash2,
  PawPrint,
  Plus,
  Search,
  Users,
  ArrowLeft,
  Calendar,
  Weight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Dog,
  Cat,
} from "lucide-react";
import type { Patient } from "../../types";
import type { Owner } from "../../types";
import { getPatients, deletePatient } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { extractId } from "../../utils/extractId";

export default function PatientListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [petToDelete, setPetToDelete] = useState<{ id: string; name: string } | null>(null);
  const itemsPerPage = 5;

  const queryClient = useQueryClient();

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const { data: owners, isLoading: isLoadingOwners } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onError: (error: Error) => {
      toast.error(error.message);
      setPetToDelete(null);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setPetToDelete(null);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getOwnerName = (ownerField: string | { _id: string; name: string } | null | undefined): string => {
    if (!ownerField) return "Propietario no encontrado";
    
    if (typeof ownerField !== 'string' && 'name' in ownerField) {
      return ownerField.name;
    }
    
    const ownerId = extractId(ownerField);
    const owner = owners?.find((o: Owner) => o._id === ownerId);
    return owner?.name || "Propietario no encontrado";
  };

  const handleDeleteClick = (petId: string, petName: string) => {
    setPetToDelete({ id: petId, name: petName });
  };

  const confirmDelete = () => {
    if (petToDelete) {
      removePatient(petToDelete.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const calculateAge = (birthDate: string): string => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
    }
    const years = Math.floor(diffInMonths / 12);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  };

  // Filtrado de pacientes
  const filteredPatients = useMemo(() => {
    return (patients || []).filter((patient: Patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.identification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOwnerName(patient.owner).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecies =
        speciesFilter === "all" ||
        patient.species.toLowerCase() === speciesFilter.toLowerCase();

      return matchesSearch && matchesSpecies;
    });
  }, [patients, searchTerm, speciesFilter, owners]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = patients?.length || 0;
    const caninos = patients?.filter((p: Patient) => p.species.toLowerCase() === "canino").length || 0;
    const felinos = patients?.filter((p: Patient) => p.species.toLowerCase() === "felino").length || 0;
    const thisMonth = patients?.filter((p: Patient) => {
      const patientDate = new Date( p.birthDate);
      const now = new Date();
      return patientDate.getMonth() === now.getMonth() && patientDate.getFullYear() === now.getFullYear();
    }).length || 0;
    return { total, caninos, felinos, thisMonth };
  }, [patients]);

  // Paginación
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  useEffect(() => {
    if (filteredPatients.length === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredPatients.length, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, speciesFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const isLoading = isLoadingPatients || isLoadingOwners;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vet-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-vet-light border-t-vet-primary rounded-full animate-spin" />
            <PawPrint className="w-6 h-6 text-vet-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-vet-text font-medium font-montserrat">Cargando pacientes...</p>
          <p className="text-vet-muted text-sm mt-1">Por favor espere</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vet-gradient">
      {/* Header Profesional */}
      <header className="bg-white shadow-soft border-b border-vet-light sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 rounded-xl bg-vet-light text-vet-primary hover:bg-vet-accent/20 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </Link>

              <div className="hidden sm:block h-8 w-px bg-vet-light" />

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-vet-text font-montserrat leading-tight">
                    Pacientes
                  </h1>
                  <p className="text-xs text-vet-muted">
                    {stats.total} paciente{stats.total !== 1 ? "s" : ""} registrado{stats.total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <Link
              to="/owners"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vet-primary text-white font-semibold hover:bg-vet-secondary transition-all duration-200 shadow-soft hover:shadow-card text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <StatCard icon={FileText} label="Total Pacientes" value={stats.total} color="primary" />
          <StatCard icon={Dog} label="Caninos" value={stats.caninos} color="blue" />
          <StatCard icon={Cat} label="Felinos" value={stats.felinos} color="purple" />
          <StatCard icon={Calendar} label="Este Mes" value={stats.thisMonth} color="green" />
        </div>

        {/* Table Container */}
        <div
          className={`bg-white rounded-2xl shadow-soft border border-vet-light/50 overflow-hidden transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Filters & Search */}
          <div className="p-4 border-b border-vet-light/50 bg-gradient-to-r from-vet-light/30 to-transparent">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vet-muted" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, raza, color, señas o propietario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-vet-light rounded-xl text-sm text-vet-text placeholder:text-vet-muted focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all"
                />
              </div>

              {/* Species Filter */}
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-vet-light rounded-xl text-sm text-vet-text focus:outline-none focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="all">Todas las especies</option>
                <option value="canino">Caninos</option>
                <option value="felino">Felinos</option>
              </select>
            </div>

            {/* Active filters indicator */}
            {(searchTerm || speciesFilter !== "all") && (
              <div className="mt-3 pt-3 border-t border-vet-light/50 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-vet-muted">Filtros:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-vet-primary/10 text-vet-primary rounded-lg text-xs font-medium">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-vet-secondary ml-1">
                      ×
                    </button>
                  </span>
                )}
                {speciesFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-vet-primary/10 text-vet-primary rounded-lg text-xs font-medium capitalize">
                    {speciesFilter}
                    <button onClick={() => setSpeciesFilter("all")} className="hover:text-vet-secondary ml-1">
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSpeciesFilter("all");
                  }}
                  className="text-xs text-vet-muted hover:text-vet-primary transition-colors ml-2"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          {currentPatients.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-vet-light/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider hidden sm:table-cell">
                        Especie/Raza
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-vet-muted uppercase tracking-wider hidden md:table-cell">
                        Propietario
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-vet-muted uppercase tracking-wider hidden lg:table-cell">
                        Edad
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-vet-muted uppercase tracking-wider hidden lg:table-cell">
                        Peso
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-vet-muted uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentPatients.map((patient: Patient, index) => {
                      const isCanino = patient.species.toLowerCase() === "canino";
                      
                      return (
                        <tr
                          key={patient._id}
                          className="hover:bg-vet-light/30 transition-colors"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          {/* Paciente */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-soft overflow-hidden ${
                                isCanino ? "bg-blue-100" : "bg-purple-100"
                              }`}>
                                {patient.photo ? (
                                  <img
                                    src={patient.photo}
                                    alt={patient.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <PawPrint className={`w-6 h-6 ${isCanino ? "text-blue-600" : "text-purple-600"}`} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/patients/${patient._id}`}
                                  className="font-semibold text-vet-primary hover:text-vet-secondary transition-colors font-montserrat truncate block"
                                >
                                  {patient.name}
                                </Link>
                                <div className="flex items-center gap-1.5 text-xs text-vet-muted mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(patient.birthDate)}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Especie/Raza */}
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize mb-1 ${
                                isCanino ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {patient.species}
                            </span>
                            {patient.breed && (
                              <p className="text-xs text-vet-muted truncate mt-1">{patient.breed}</p>
                            )}
                          </td>

                          {/* Propietario */}
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-vet-accent flex-shrink-0" />
                              <span className="text-sm text-vet-text truncate">
                                {getOwnerName(patient.owner)}
                              </span>
                            </div>
                          </td>

                          {/* Edad */}
                          <td className="px-6 py-4 text-center hidden lg:table-cell">
                            <span className="text-sm font-medium text-vet-text">
                              {calculateAge(patient.birthDate)}
                            </span>
                          </td>

                          {/* Peso */}
                          <td className="px-6 py-4 text-center hidden lg:table-cell">
                            {patient.weight ? (
                              <div className="flex items-center justify-center gap-1">
                                <Weight className="w-4 h-4 text-vet-accent" />
                                <span className="text-sm font-medium text-vet-text">
                                  {patient.weight} kg
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-vet-muted">—</span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                to={`/patients/${patient._id}`}
                                className="p-2 rounded-lg bg-vet-light text-vet-primary hover:bg-vet-primary hover:text-white transition-all duration-200"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/patients/edit/${patient._id}`}
                                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(patient._id, patient.name)}
                                disabled={isDeleting}
                                className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-vet-light/50 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-vet-muted">
                    Mostrando{" "}
                    <span className="font-semibold text-vet-text">{startIndex + 1}</span> -{" "}
                    <span className="font-semibold text-vet-text">
                      {Math.min(startIndex + itemsPerPage, filteredPatients.length)}
                    </span>{" "}
                    de <span className="font-semibold text-vet-text">{filteredPatients.length}</span> pacientes
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-vet-light text-vet-primary hover:bg-vet-primary hover:text-white hover:border-vet-primary"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = currentPage === pageNum;

                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                isCurrentPage
                                  ? "bg-vet-primary text-white shadow-soft"
                                  : "bg-white border border-vet-light text-vet-text hover:border-vet-primary hover:text-vet-primary"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="text-vet-muted px-1">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-vet-light text-vet-primary hover:bg-vet-primary hover:text-white hover:border-vet-primary"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-vet-light rounded-full flex items-center justify-center">
                <PawPrint className="w-10 h-10 text-vet-muted" />
              </div>

              {patients && patients.length === 0 ? (
                <>
                  <h3 className="text-xl font-bold text-vet-text mb-2 font-montserrat">
                    No hay pacientes registrados
                  </h3>
                  <p className="text-vet-muted mb-8 max-w-md mx-auto">
                    Comienza agregando el primer paciente al sistema para gestionar sus historiales médicos.
                  </p>
                  <Link
                    to="/owners"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vet-primary hover:bg-vet-secondary text-white font-semibold shadow-soft hover:shadow-card transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Primer Paciente
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-vet-text mb-2 font-montserrat">
                    No se encontraron resultados
                  </h3>
                  <p className="text-vet-muted mb-6">Intenta ajustar los filtros de búsqueda</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSpeciesFilter("all");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vet-light text-vet-primary hover:bg-vet-primary hover:text-white transition-all font-medium"
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={!!petToDelete}
        onClose={() => setPetToDelete(null)}
        onConfirm={confirmDelete}
        petName={petToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Componente de Stats Card
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "primary" | "blue" | "purple" | "green";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-vet-light",
      icon: "text-vet-primary",
      value: "text-vet-primary",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      value: "text-purple-600",
    },
    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      value: "text-emerald-600",
    },
  };

  const classes = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-vet-light/50 hover:shadow-card transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${classes.bg}`}>
          <Icon className={`w-5 h-5 ${classes.icon}`} />
        </div>
        <div>
          <p className="text-xs text-vet-muted font-medium">{label}</p>
          <p className={`text-xl font-bold ${classes.value} font-montserrat`}>{value}</p>
        </div>
      </div>
    </div>
  );
}