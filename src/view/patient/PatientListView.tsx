// src/views/patients/PatientListView.tsx
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Plus, ArrowLeft } from "lucide-react";

import { getPatients } from "../../api/patientAPI";
import { getOwners } from "../../api/OwnerAPI";
import { extractId } from "../../utils/extractId";
import type { Patient, Owner } from "../../types";

import PatientStats from "../../components/patients/PatientStats";
import PatientFilters from "../../components/patients/PatientFilters";
import PatientList from "../../components/patients/PatientList";

export default function PatientListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const { data: owners = [], isLoading: isLoadingOwners } = useQuery({
    queryKey: ["owners"],
    queryFn: getOwners,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, speciesFilter]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient: Patient) => {
      const getOwnerName = (): string => {
        if (!patient.owner) return "";
        if (typeof patient.owner !== "string" && "name" in patient.owner) {
          return patient.owner.name;
        }
        const ownerId = extractId(patient.owner);
        const owner = owners.find((o: Owner) => o._id === ownerId);
        return owner?.name || "";
      };

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        patient.name.toLowerCase().includes(searchLower) ||
        patient.species.toLowerCase().includes(searchLower) ||
        patient.breed?.toLowerCase().includes(searchLower) ||
        patient.color?.toLowerCase().includes(searchLower) ||
        patient.identification?.toLowerCase().includes(searchLower) ||
        getOwnerName().toLowerCase().includes(searchLower);

      const matchesSpecies =
        speciesFilter === "all" ||
        patient.species.toLowerCase() === speciesFilter.toLowerCase();

      return matchesSearch && matchesSpecies;
    });
  }, [patients, owners, searchTerm, speciesFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("all");
  };

  const isLoading = isLoadingPatients || isLoadingOwners;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vet-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-vet-light border-t-vet-primary rounded-full animate-spin" />
            <PawPrint className="w-6 h-6 text-vet-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-vet-text font-medium font-montserrat">Cargando pacientes...</p>
          <p className="text-vet-muted text-sm mt-1">Por favor espere</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vet-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft border-b border-vet-light/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 rounded-xl bg-vet-light text-vet-primary hover:bg-vet-primary hover:text-white transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>

              <div className="hidden sm:block h-8 w-px bg-vet-light" />

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-yellowtail text-vet-text ">
                    Pacientes
                  </h1>
                  <p className="text-xs text-vet-muted hidden sm:block">
                    {patients.length} registrado{patients.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Right */}
            <Link
              to="/owners"
              className="
                inline-flex items-center gap-2 
                px-4 py-2.5 rounded-xl 
                bg-gradient-to-r from-vet-primary to-vet-secondary 
                text-white font-semibold text-sm
                shadow-soft hover:shadow-card
                transition-all duration-200
                hover:scale-105
                group
              "
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <PatientStats patients={patients} isVisible={mounted} />

        {/* Filters & List Container */}
        <div
          className={`
            bg-white rounded-2xl shadow-soft border border-vet-light/50 
            overflow-hidden
            transition-all duration-500 delay-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {/* Filters */}
          <div className="p-4 sm:p-5 border-b border-vet-light/50 bg-gradient-to-r from-vet-light/20 to-transparent">
            <PatientFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              speciesFilter={speciesFilter}
              onSpeciesChange={setSpeciesFilter}
            />
          </div>

          {/* List */}
          <div className="p-4 sm:p-5">
            <PatientList
              patients={filteredPatients}
              owners={owners}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={6}
              onClearFilters={clearFilters}
              hasAnyPatients={patients.length > 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}