// src/views/labExams/LabExamDetailView.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabExamById, deleteLabExam } from "../../api/labExamAPI";
import { getPatientById } from "../../api/patientAPI"; // ✅ Necesitas esta función
import { toast } from "../../components/Toast";
import { Edit, Trash, ArrowLeft, Heart, TestTube, Sparkles } from "lucide-react";
import BackButton from "../../components/BackButton";
import FloatingParticles from "../../components/FloatingParticles";

export default function LabExamDetailView() {
  const { patientId, labExamId } = useParams<{ patientId: string, labExamId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Cargar el examen
  const { data: labExam, isLoading: isLoadingExam, isError: isErrorExam, error: examError } = useQuery({
    queryKey: ["labExam", labExamId],
    queryFn: () => {
      if (!patientId || !labExamId) throw new Error("IDs no encontrados");
      return getLabExamById(patientId, labExamId);
    },
    enabled: !!patientId && !!labExamId,
  });

  // ✅ Cargar el paciente (usando el patientId del examen o de la URL)
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId!),
    enabled: !!patientId,
  });

  // Mutación para eliminar el examen
  const { mutate: deleteExam, isPending: isDeleting } = useMutation({
    mutationFn: deleteLabExam,
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Examen de laboratorio eliminado correctamente");
      queryClient.invalidateQueries({
        queryKey: ["labExams", { patientId }],
      });
      navigate(`/patients/${patientId}/lab-exams`);
    },
  });

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este examen de laboratorio?")) {
      if (labExamId) {
        deleteExam(labExamId);
      }
    }
  };

  const isLoading = isLoadingExam || isLoadingPatient;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-space-navy text-misty-lilac">
        <p>Cargando examen y paciente...</p>
      </div>
    );
  }

  if (isErrorExam) {
    return (
      <div className="flex justify-center items-center h-screen bg-space-navy text-coral-pulse">
        <p>Error al cargar el examen: {examError.message}</p>
      </div>
    );
  }

  if (!labExam) {
    return (
      <div className="flex justify-center items-center h-screen bg-space-navy text-lavender-fog">
        <p>No se encontró el examen.</p>
      </div>
    );
  }

  const differentialFields = {
    segmentedNeutrophils: "Neutrófilos Segmentados",
    bandNeutrophils: "Neutrófilos en Banda",
    lymphocytes: "Linfocitos",
    monocytes: "Monocitos",
    basophils: "Basófilos",
    reticulocytes: "Reticulocitos",
    eosinophils: "Eosinófilos",
    nrbc: "NRBC",
  };

  return (
    <div className="relative min-h-screen bg-space-navy overflow-hidden text-misty-lilac p-6 sm:p-10">
      <FloatingParticles />
      <div className="fixed top-6 left-6 z-50">
        <BackButton />
      </div>

      <div className="max-w-4xl mx-auto pt-16 pb-12">
        {/* ✅ Mostrar nombre del paciente */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-lavender-fog">
            Paciente: <span className="text-electric-mint">{patient?.name || "Cargando..."}</span>
          </h2>
          {patient && (
            <p className="text-lg text-lavender-fog/70">
              {patient.species} {patient.breed ? `(${patient.breed})` : ""}
            </p>
          )}
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-coral-pulse">
            Detalles del Examen
          </h1>
          <p className="text-lg text-lavender-fog/80">
            Fecha: {new Date(labExam.date).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-space-navy/70 backdrop-blur-md rounded-lg p-8 border border-coral-pulse/20 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-electric-mint">Valores Generales</h2>
              <p className="text-lg"><span className="font-bold">Hematocrito:</span> {labExam.hematocrit}%</p>
              <p className="text-lg"><span className="font-bold">Glóbulos Blancos:</span> {labExam.whiteBloodCells} x10^3/uL</p>
              <p className="text-lg"><span className="font-bold">Proteína Total:</span> {labExam.totalProtein} g/dL</p>
              <p className="text-lg"><span className="font-bold">Plaquetas:</span> {labExam.platelets} x10^3/uL</p>
            </div>
            
            <div className="space-y-4 mt-6 md:mt-0">
              <h2 className="text-2xl font-semibold text-electric-mint">Conteo Diferencial</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
                {Object.entries(labExam.differentialCount).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-bold">
                      {differentialFields[key as keyof typeof differentialFields]}:
                    </span> {value}
                  </p>
                ))}
              </div>
              <p className="text-lg"><span className="font-bold">Total de células contadas:</span> {labExam.totalCells}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate(`/patients/${patientId}/lab-exams/edit/${labExamId}`)}
            className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-electric-mint/20 via-electric-mint/30 to-electric-mint/20 border-2 border-electric-mint/40 rounded-lg text-misty-lilac font-bold hover:scale-105 transition-all duration-300"
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 border-2 border-coral-pulse/40 rounded-lg text-misty-lilac font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash className="w-5 h-5 mr-2" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}