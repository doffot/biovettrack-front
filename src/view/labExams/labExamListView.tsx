// src/views/labExams/LabExamListView.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLabExamsByPatient } from "../../api/labExamAPI";
import { getPatientById } from "../../api/patientAPI";
import { PlusCircle } from "lucide-react";
import BackButton from "../../components/BackButton";

export default function LabExamListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: labExams, isLoading: isLoadingExams, isError: isErrorExams, error: errorExams } = useQuery({
    queryKey: ["labExams", { patientId }],
    queryFn: () => {
      if (!patientId) throw new Error("ID del paciente no encontrado");
      return getLabExamsByPatient(patientId);
    },
    enabled: !!patientId,
  });

  const { data: patient, isLoading: isLoadingPatient, isError: isErrorPatient, error: errorPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => {
      if (!patientId) throw new Error("ID del paciente no encontrado");
      return getPatientById(patientId);
    },
    enabled: !!patientId,
  });

  const handleCreateLabExam = () => {
    navigate(`/patients/${patientId}/lab-exams/create`);
  };

  if (isLoadingExams || isLoadingPatient) {
    return (
      <div className="flex justify-center items-center h-screen bg-space-navy text-misty-lilac">
        <p>Cargando información...</p>
      </div>
    );
  }

  if (isErrorExams || isErrorPatient) {
    return (
      <div className="flex justify-center items-center h-screen bg-space-navy text-coral-pulse">
        <p>Error al cargar la información: {errorExams?.message || errorPatient?.message}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-space-navy overflow-hidden text-misty-lilac p-6 sm:p-10">
      <div className="fixed top-6 left-6 z-50">
        <BackButton />
      </div>

      <div className="max-w-4xl mx-auto pt-16 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-coral-pulse">
            Historial de Hematología
          </h1>
          <p className="text-lg text-lavender-fog/80">
            {patient?.name ? `del paciente: ${patient.name}` : ''}
          </p>
        </div>

        {labExams && labExams.length > 0 ? (
          <div className="space-y-4">
            {labExams.map((exam) => (
              // ✅ Corrige la ruta del enlace para que coincida con la del backend
            <Link
  key={exam._id}
  to={`/patients/${patientId}/lab-exams/${exam._id}`}
  className="block"
>
                <div
                  className="bg-space-navy/70 backdrop-blur-md rounded-lg p-5 border border-coral-pulse/20 shadow-lg cursor-pointer transition-transform duration-200 hover:scale-[1.01] hover:bg-space-navy/80"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-electric-mint">
                      {new Date(exam.date).toLocaleDateString()}
                    </h3>
                    <p className="text-lg text-misty-lilac">
                      Hematocrito: <span className="font-bold text-coral-pulse">{exam.hematocrit}%</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-space-navy/60 backdrop-blur-md rounded-lg border border-coral-pulse/20 shadow-lg">
            <p className="text-base font-semibold text-lavender-fog">
              No hay exámenes de laboratorio registrados para este paciente.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleCreateLabExam}
            className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-coral-pulse/20 via-coral-pulse/30 to-coral-pulse/20 border-2 border-coral-pulse/40 rounded-lg text-misty-lilac font-bold text-base hover:scale-105 transition-all duration-300"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear Examen
          </button>
        </div>
      </div>
    </div>
  );
}