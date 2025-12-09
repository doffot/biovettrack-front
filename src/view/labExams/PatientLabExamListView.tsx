// src/views/labExams/PatientLabExamListView.tsx
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLabExamsByPatient } from "../../api/labExamAPI";
import {
  FlaskConical,
  Plus,
  Calendar,
  DollarSign,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function PatientLabExamListView() {
  const { patientId } = useParams<{ patientId: string }>();

  const { data: exams = [], isLoading, isError } = useQuery({
    queryKey: ["labExams", "patient", patientId],
    queryFn: () => getLabExamsByPatient(patientId!),
    enabled: !!patientId,
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm">Error al cargar exámenes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Exámenes de Laboratorio</h2>
          <span className="px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
            {exams.length}
          </span>
        </div>
        <Link
          to={`/patients/${patientId}/lab-exams/create`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo
        </Link>
      </div>

      {/* Lista */}
      {exams.length === 0 ? (
        <div className="py-12 text-center">
          <FlaskConical className="w-10 h-10 mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-500 mb-4">Sin exámenes registrados</p>
          <Link
            to={`/patients/${patientId}/lab-exams/create`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear primer examen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map((exam) => (
            <Link
              key={exam._id}
              to={`/patients/${patientId}/lab-exams/${exam._id}`}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Hemograma
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(exam.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${exam.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Indicadores rápidos */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                  <span className="px-2 py-0.5 bg-gray-50 rounded">
                    Hct: {exam.hematocrit}%
                  </span>
                  <span className="px-2 py-0.5 bg-gray-50 rounded">
                    WBC: {exam.whiteBloodCells}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}