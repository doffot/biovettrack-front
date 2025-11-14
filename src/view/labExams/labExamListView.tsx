// src/views/labExams/LabExamListView.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLabExamsByPatient } from "../../api/labExamAPI";
import { getPatientById } from "../../api/patientAPI";
import {
  PlusCircle,
  ArrowLeft,
  Activity,
  Calendar,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function LabExamListView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const {
    data: labExams,
    isLoading: isLoadingExams,
    isError: isErrorExams,
    error: errorExams,
  } = useQuery({
    queryKey: ["labExams", { patientId }],
    queryFn: () => {
      if (!patientId) throw new Error("ID del paciente no encontrado");
      return getLabExamsByPatient(patientId);
    },
    enabled: !!patientId,
  });

  const {
    data: patient,
    isLoading: isLoadingPatient,
    isError: isErrorPatient,
    error: errorPatient,
  } = useQuery({
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
      <div className="min-h-screen bg-vet-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-vet-text font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (isErrorExams || isErrorPatient) {
    return (
      <div className="min-h-screen bg-vet-gradient flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-card border-l-4 border-red-500 max-w-md">
          <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-vet-text text-center mb-2">
            Error al cargar
          </h2>
          <p className="text-vet-muted text-center text-sm">
            {errorExams?.message || errorPatient?.message}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full py-2.5 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const stats =
    labExams && labExams.length > 0
      ? {
          total: labExams.length,
          promedio: (
            labExams.reduce((sum, exam) => sum + exam.hematocrit, 0) /
            labExams.length
          ).toFixed(1),
          ultimo: labExams[0]?.hematocrit || 0,
        }
      : null;

  return (
    <div className="min-h-screen bg-vet-gradient">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl hover:bg-white/80 text-vet-primary transition-all hover:scale-105 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-soft">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-vet-text">
                  Hematología
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-vet-muted">Paciente:</p>
                  <p className="text-lg font-bold text-vet-primary bg-vet-light/50 px-3 py-1 rounded-lg">
                    {patient?.name || "Paciente"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateLabExam}
            className="flex items-center gap-2 px-4 py-2.5 bg-vet-primary text-white rounded-xl font-semibold hover:bg-vet-accent transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Examen</span>
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-card border-l-4 border-vet-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vet-light rounded-lg">
                  <FileText className="w-5 h-5 text-vet-primary" />
                </div>
                <div>
                  <p className="text-sm text-vet-muted font-medium">
                    Total Exámenes
                  </p>
                  <p className="text-2xl font-bold text-vet-text">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-card border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-vet-muted font-medium">
                    Promedio HCT
                  </p>
                  <p className="text-2xl font-bold text-vet-text">
                    {stats.promedio}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-card border-l-4 border-pink-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Activity className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-vet-muted font-medium">
                    Último HCT
                  </p>
                  <p className="text-2xl font-bold text-vet-text">
                    {stats.ultimo}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Exámenes */}
        <div className="bg-white rounded-xl shadow-card border-l-4 border-vet-primary overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-vet-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-vet-primary" />
              Historial de Exámenes
            </h2>
            <p className="text-sm text-vet-muted mt-1">
              {labExams && labExams.length > 0
                ? `${labExams.length} examen${
                    labExams.length !== 1 ? "es" : ""
                  } registrado${labExams.length !== 1 ? "s" : ""}`
                : "No hay exámenes registrados"}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {labExams && labExams.length > 0 ? (
              labExams.map((exam, index) => {
                const isRecent = index === 0;

                return (
                  <Link
                    key={exam._id}
                    to={`/patients/${patientId}/lab-exams/${exam._id}`}
                    className="block hover:bg-vet-light/30 transition-colors"
                  >
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Indicador visual */}
                        <div
                          className={`w-1 h-12 rounded-full ${
                            isRecent ? "bg-vet-primary" : "bg-gray-300"
                          }`}
                        />

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-vet-text text-sm">
                              {new Date(
                                exam.date.split("T")[0] + "T12:00:00"
                              ).toLocaleDateString("es-ES", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            {isRecent && (
                              <span className="px-2 py-0.5 bg-vet-primary text-white text-xs font-semibold rounded-full">
                                Reciente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-vet-muted">
                            Hematocrito:{" "}
                            <span className="font-bold text-vet-primary">
                              {exam.hematocrit}%
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Indicador de HCT */}
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-2xl font-black text-vet-primary">
                            {exam.hematocrit}
                          </p>
                          <p className="text-xs text-vet-muted">HCT %</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-vet-text mb-2">
                  Sin exámenes registrados
                </h3>
                <p className="text-sm text-vet-muted mb-6">
                  Aún no hay exámenes de laboratorio para este paciente.
                </p>
                <button
                  onClick={handleCreateLabExam}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-vet-primary text-white rounded-lg font-medium hover:bg-vet-accent transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear Primer Examen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Botón flotante móvil */}
        <button
          onClick={handleCreateLabExam}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-vet-primary text-white rounded-full shadow-lg hover:bg-vet-accent transition-all hover:scale-110 flex items-center justify-center z-50"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
