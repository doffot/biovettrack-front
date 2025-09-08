// src/components/PatientListView.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, EyeIcon, EditIcon, Trash2Icon, Heart } from "lucide-react";
import { getPatientsByOwner, deletePatient } from "../../api/patientAPI";
import { toast } from "../../components/Toast";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

interface PatientListViewProps {
  ownerId: string;
  ownerName: string;
}

export default function PatientListView({ ownerId, ownerName }: PatientListViewProps) {
  const queryClient = useQueryClient();
  const [petToDelete, setPetToDelete] = useState<{id: string, name: string} | null>(null);

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', { ownerId }],
    queryFn: () => getPatientsByOwner(ownerId),
    enabled: !!ownerId,
  });

  const { mutate: removePatient, isPending: isDeleting } = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onError: (error: Error) => {
      toast.error(error.message);
      setPetToDelete(null);
    },
    onSuccess: () => {
      toast.success("Mascota eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["patients", { ownerId }] });
      setPetToDelete(null);
    },
  });

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
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'perro':
      case 'dog':
        return '🐕';
      case 'gato':
      case 'cat':
        return '🐱';
      case 'ave':
      case 'bird':
        return '🐦';
      case 'conejo':
      case 'rabbit':
        return '🐰';
      default:
        return '🐾';
    }
  };

  return (
    <>
      <div className="mt-6 pt-4 border-t border-primary/20">
        {/* Header con información del propietario */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text">Mascotas de {ownerName}</h4>
              <p className="text-xs text-muted">
                {patients.length} {patients.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
              </p>
            </div>
          </div>
          
          {patients.length > 0 && (
            <div className="text-xs text-muted bg-primary/10 px-2 py-1 rounded-full">
              Total: {patients.length}
            </div>
          )}
        </div>

        {/* Lista de mascotas */}
        {patientsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted text-sm">Cargando mascotas...</p>
            </div>
          </div>
        ) : patients.length > 0 ? (
          <div className="space-y-3 
                         xl:max-h-[280px] 
                         xl:overflow-y-auto 
                         xl:pr-2 
                         scrollbar-thin 
                         scrollbar-track-transparent 
                         scrollbar-thumb-primary-20 
                         hover:scrollbar-thumb-primary-40">
            {patients.map((pet, index) => (
              <div
                key={pet._id}
                className="relative overflow-hidden rounded-xl border bg-gradient-radial-center backdrop-blur-sm bg-background/70 border-primary/20 p-3 sm:p-4 
                           group hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 hover:border-primary/40"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Efecto de shimmer al hacer hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100" />

                {/* Layout móvil vs desktop */}
                <div className="relative z-10">
                  {/* Vista Mobile - Layout vertical */}
                  <div className="block sm:hidden">
                    {/* Header móvil con foto y botones */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Foto de la mascota con indicador de especie */}
                        <div className="relative">
                          {pet.photo ? (
                            <img
                              src={pet.photo}
                              alt={pet.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary/40 group-hover:border-primary/60 transition-all duration-300"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 group-hover:border-primary/60 transition-all duration-300">
                              <PawPrint className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          
                          {/* Indicador de especie */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background/90 rounded-full flex items-center justify-center text-xs border border-primary/30">
                            {getSpeciesIcon(pet.species)}
                          </div>
                        </div>

                        {/* Nombre y género */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-text font-bold text-sm truncate">{pet.name}</h5>
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                              {pet.sex === 'Macho' ? 'M' : 'H'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción móvil */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Botón Ver */}
                        <Link
                          to={`/patients/${pet._id}`}
                          className="p-1.5 text-primary/70 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/10"
                          title="Ver detalles de la mascota"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </Link>

                        {/* Botón Editar */}
                        <Link
                          to={`/patients/edit/${pet._id}`}
                          className="p-1.5 text-primary/70 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/10"
                          title="Editar información"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </Link>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => handleDeleteClick(pet._id, pet.name)}
                          disabled={isDeleting}
                          className="p-1.5 text-danger/70 hover:text-danger transition-all duration-200 rounded-lg hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar mascota"
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Información detallada móvil */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted pl-13">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></span>
                        <span className="truncate">{pet.species}</span>
                      </span>
                      
                      {pet.breed && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted rounded-full flex-shrink-0"></span>
                          <span className="truncate">{pet.breed}</span>
                        </span>
                      )}
                      
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-muted rounded-full flex-shrink-0"></span>
                        <span className="truncate">{formatDate(pet.birthDate)}</span>
                      </span>
                      
                      {pet.weight && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted rounded-full flex-shrink-0"></span>
                          <span className="truncate">{pet.weight} kg</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vista Tablet/Desktop - Layout horizontal original */}
                  <div className="hidden sm:flex items-center gap-4">
                    {/* Foto de la mascota con indicador de especie */}
                    <div className="relative">
                      {pet.photo ? (
                        <img
                          src={pet.photo}
                          alt={pet.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 group-hover:border-primary/60 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 group-hover:border-primary/60 transition-all duration-300">
                          <PawPrint className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      
                      {/* Indicador de especie */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background/90 rounded-full flex items-center justify-center text-sm border border-primary/30">
                        {getSpeciesIcon(pet.species)}
                      </div>
                    </div>

                    {/* Información de la mascota */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-text font-bold text-base truncate">{pet.name}</h5>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                          {pet.sex === 'Macho' ? 'Macho' : 'Hembra'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {pet.species}
                        </span>
                        
                        {pet.breed && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-muted rounded-full"></span>
                            {pet.breed}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-muted rounded-full"></span>
                          {formatDate(pet.birthDate)}
                        </span>
                        
                        {pet.weight && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-muted rounded-full"></span>
                            {pet.weight} kg
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción desktop/tablet */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Botón Ver */}
                      <Link
                        to={`/patients/${pet._id}`}
                        className="p-2 text-primary/70 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/10 hover:scale-110"
                        title="Ver detalles de la mascota"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>

                      {/* Botón Editar */}
                      <Link
                        to={`/patients/edit/${pet._id}`}
                        className="p-2 text-primary/70 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/10 hover:scale-110"
                        title="Editar información"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Link>

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleDeleteClick(pet._id, pet.name)}
                        disabled={isDeleting}
                        className="p-2 text-danger/70 hover:text-danger transition-all duration-200 rounded-lg hover:bg-danger/10 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar mascota"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Punto de estado activo */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-neon-pulse opacity-60" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <PawPrint className="w-8 h-8 text-muted/60" />
            </div>
            <p className="text-muted font-medium mb-1">Sin mascotas registradas</p>
            <p className="text-muted/70 text-sm px-4">
              {ownerName} aún no tiene mascotas asociadas a su perfil
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <DeleteConfirmationModal
        isOpen={!!petToDelete}
        onClose={() => setPetToDelete(null)}
        onConfirm={confirmDelete}
        petName={petToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </>
  );
}