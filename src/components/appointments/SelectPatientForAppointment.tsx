// src/view/appointments/SelectPatientForAppointment.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  PawPrint,
  User,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Dog,
  Cat,
  UserPlus,
} from "lucide-react";
import { getPatients } from "../../api/patientAPI";

export default function SelectPatientForAppointment() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<"all" | "Canino" | "Felino">("all");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (speciesFilter !== "all" && patient.species !== speciesFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const ownerName = typeof patient.owner === "object"
          ? patient.owner.name.toLowerCase()
          : "";
        
        if (
          !patient.name.toLowerCase().includes(search) &&
          !ownerName.includes(search) &&
          !(patient.breed || "").toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [patients, searchTerm, speciesFilter]);

  const handleSelectPatient = (patientId: string) => {
    navigate(`/patients/${patientId}/appointments/create`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-vet-muted font-medium">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 lg:p-6 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-2 text-vet-muted hover:text-vet-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a citas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-vet-text">Nueva Cita</h1>
              <p className="text-vet-muted">Selecciona el paciente para agendar la cita</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NUEVO: Card para crear nuevo dueño/paciente */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">¿El paciente no está registrado?</h3>
              <p className="text-sm text-amber-700">
                Primero debes registrar al dueño y luego agregar la mascota
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/owners/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-amber-300 text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Dueño
            </Link>
            <Link
              to="/patients"
              state={{ openCreateModal: true }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              <PawPrint className="w-4 h-4" />
              Nueva Mascota
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, dueño o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-vet-primary focus:ring-2 focus:ring-vet-primary/20 transition-all"
            />
          </div>

          {/* Species Filter */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setSpeciesFilter("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === "all"
                  ? "bg-white text-vet-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PawPrint className="w-4 h-4" />
              <span className="hidden sm:inline">Todos</span>
            </button>
            <button
              onClick={() => setSpeciesFilter("Canino")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === "Canino"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Dog className="w-4 h-4" />
              <span className="hidden sm:inline">Caninos</span>
            </button>
            <button
              onClick={() => setSpeciesFilter("Felino")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                speciesFilter === "Felino"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Cat className="w-4 h-4" />
              <span className="hidden sm:inline">Felinos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <PawPrint className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-vet-text mb-2">
            {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
          </h3>
          <p className="text-vet-muted mb-6">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Registra un dueño y su mascota para poder agendar citas"}
          </p>
          
          {/* ✅ Botones de acción cuando no hay resultados */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/owners/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-vet-primary hover:bg-vet-secondary text-white font-semibold rounded-xl transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Registrar Dueño
            </Link>
            {patients.length > 0 && searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPatients.map((patient) => {
            const owner = typeof patient.owner === "object" ? patient.owner : null;
            const isCanino = patient.species?.toLowerCase() === "canino";

            return (
              <button
                key={patient._id}
                onClick={() => handleSelectPatient(patient._id)}
                className="bg-white rounded-xl border border-gray-100 shadow-soft p-4 text-left hover:shadow-lg hover:border-vet-primary/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {patient.photo ? (
                      <img
                        src={patient.photo}
                        alt={patient.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-soft"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 border-white shadow-soft ${
                        isCanino ? "bg-blue-100" : "bg-purple-100"
                      }`}>
                        <span className="text-2xl">{isCanino ? "🐕" : "🐱"}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-vet-text truncate group-hover:text-vet-primary transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-vet-muted truncate">
                      {patient.breed || patient.species}
                    </p>
                    {owner && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span className="truncate">{owner.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-vet-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ✅ NUEVO: Contador de resultados */}
      {filteredPatients.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-vet-muted">
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </p>
        </div>
      )}
    </div>
  );
}