// src/views/labExams/LabExamDetailView.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLabExamById } from "../../api/labExamAPI";
import { useState } from "react";
import ShareResultsModal from "../../components/ShareResultsModal";
import {
  ArrowLeft,
  Printer,
  AlertCircle,
  Check,
  FlaskConical,
  Pencil,
  User,
} from "lucide-react";

export default function LabExamDetailView() {
  const { id, labExamId, patientId } = useParams<{ 
    id?: string; 
    labExamId?: string; 
    patientId?: string 
  }>();
  const examId = id || labExamId;
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: exam, isLoading, isError } = useQuery({
    queryKey: ["labExam", examId],
    queryFn: () => getLabExamById(examId!),
    enabled: !!examId,
  });

  // Rangos normales
  const normalValues = {
    canino: {
      hematocrit: [37, 55] as const,
      whiteBloodCells: [6000, 17000] as const,
      totalProtein: [5.4, 7.8] as const,
      platelets: [200000, 500000] as const,
      segmentedNeutrophils: [60, 77] as const,
      bandNeutrophils: [0, 3] as const,
      lymphocytes: [12, 30] as const,
      monocytes: [3, 10] as const,
      eosinophils: [2, 10] as const,
      basophils: [0, 0] as const,
    },
    felino: {
      hematocrit: [30, 45] as const,
      whiteBloodCells: [5000, 19500] as const,
      totalProtein: [5.7, 8.9] as const,
      platelets: [300000, 800000] as const,
      segmentedNeutrophils: [35, 75] as const,
      bandNeutrophils: [0, 3] as const,
      lymphocytes: [20, 55] as const,
      monocytes: [1, 4] as const,
      eosinophils: [2, 12] as const,
      basophils: [0, 0] as const,
    },
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isOutOfRange = (value: number, range: readonly [number, number]) =>
    value < range[0] || value > range[1];

  const calculateAbsolute = (percentage: number, wbc: number) =>
    ((percentage / 100) * wbc).toFixed(0);

  const backUrl = patientId ? `/patients/${patientId}/lab-exams` : "/lab-exams";

  // Verificar si es paciente referido (no tiene patientId)
  const isReferredPatient = exam && !exam.patientId;

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error
  if (isError || !exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-gray-300" />
        <p className="text-sm text-gray-500">Examen no encontrado</p>
        <Link to={backUrl} className="text-sm text-gray-900 hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  const speciesKey = exam.species.toLowerCase() === "felino" ? "felino" : "canino";
  const ranges = normalValues[speciesKey];

  const hemogramParams = [
    { label: "Hematocrito", value: exam.hematocrit, unit: "%", range: ranges.hematocrit },
    { label: "Leucocitos", value: exam.whiteBloodCells, unit: "/µL", range: ranges.whiteBloodCells },
    { label: "Proteínas", value: exam.totalProtein, unit: "g/dL", range: ranges.totalProtein },
    { label: "Plaquetas", value: exam.platelets, unit: "/µL", range: ranges.platelets },
  ];

  const differentialParams = [
    { key: "segmentedNeutrophils", label: "Seg. Neutrófilos", value: exam.differentialCount.segmentedNeutrophils || 0 },
    { key: "bandNeutrophils", label: "Banda Neutrófilos", value: exam.differentialCount.bandNeutrophils || 0 },
    { key: "lymphocytes", label: "Linfocitos", value: exam.differentialCount.lymphocytes || 0 },
    { key: "monocytes", label: "Monocitos", value: exam.differentialCount.monocytes || 0 },
    { key: "eosinophils", label: "Eosinófilos", value: exam.differentialCount.eosinophils || 0 },
    { key: "basophils", label: "Basófilos", value: exam.differentialCount.basophils || 0 },
  ];

  const outOfRangeCount = hemogramParams.filter((p) => isOutOfRange(p.value, p.range)).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backUrl} className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-gray-900">Hemograma</h1>
                {/* Badge de paciente referido */}
                {isReferredPatient && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                    <User className="w-2.5 h-2.5" />
                    Referido
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatDate(exam.date)}</p>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Botón Editar - Solo para pacientes referidos */}
            {isReferredPatient && (
              <Link
                to={`/lab-exams/${examId}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </Link>
            )}
            
            {/* Botón Imprimir */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Paciente */}
        <section className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <FlaskConical className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{exam.patientName}</p>
              <p className="text-xs text-gray-500">
                {exam.species} {exam.breed && `• ${exam.breed}`} {exam.sex && `• ${exam.sex}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Costo</p>
            <p className="text-sm font-semibold text-gray-900">${exam.cost.toFixed(2)}</p>
          </div>
        </section>

        {/* Resumen rápido */}
        <section className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Normales</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {4 - outOfRangeCount}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Alterados</span>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-1">
              {outOfRangeCount}
            </p>
          </div>
        </section>

        {/* Hemograma */}
        <section>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Hemograma
          </h2>
          <div className="space-y-2">
            {hemogramParams.map((param) => {
              const isOut = isOutOfRange(param.value, param.range);
              return (
                <div
                  key={param.label}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isOut ? "bg-red-50 border-red-100" : "bg-white border-gray-100"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{param.label}</p>
                    <p className="text-xs text-gray-400">
                      Ref: {param.range[0]} - {param.range[1]} {param.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isOut ? "text-red-600" : "text-gray-900"}`}>
                      {param.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{param.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fórmula Leucocitaria */}
        <section>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Fórmula Leucocitaria
          </h2>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">%</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Abs.</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Ref.</th>
                </tr>
              </thead>
              <tbody>
                {differentialParams.map((cell) => {
                  const range = ranges[cell.key as keyof typeof ranges];
                  const isOut = isOutOfRange(cell.value, range);
                  return (
                    <tr
                      key={cell.key}
                      className={`border-b border-gray-50 last:border-0 ${
                        isOut ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 text-gray-900">{cell.label}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${isOut ? "text-red-600" : "text-gray-900"}`}>
                        {cell.value}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-500">
                        {calculateAbsolute(cell.value, exam.whiteBloodCells)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-400 text-xs">
                        {range[0]}-{range[1]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Total contado: {exam.totalCells}%
          </p>
        </section>

        {/* Observaciones */}
        {(exam.hemotropico || exam.observacion) && (
          <section>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Observaciones
            </h2>
            <div className="space-y-2">
              {exam.hemotropico && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-medium text-blue-700 mb-1">Hemotrópicos</p>
                  <p className="text-sm text-gray-900">{exam.hemotropico}</p>
                </div>
              )}
              {exam.observacion && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-500 mb-1">General</p>
                  <p className="text-sm text-gray-900">{exam.observacion}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Info adicional */}
        {(exam.treatingVet || exam.ownerName) && (
          <section className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {exam.treatingVet && (
                <div>
                  <p className="text-xs text-gray-400">Veterinario</p>
                  <p className="text-gray-900">{exam.treatingVet}</p>
                </div>
              )}
              {exam.ownerName && (
                <div>
                  <p className="text-xs text-gray-400">Propietario</p>
                  <p className="text-gray-900">{exam.ownerName}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Modal */}
      {showShareModal && (
        <ShareResultsModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          examData={exam}
          patientData={{
            name: exam.patientName,
            species: exam.species,
            owner: { name: exam.ownerName || "—", contact: exam.ownerPhone || "—" },
            mainVet: exam.treatingVet || "—",
            refVet: "—",
          }}
        />
      )}
    </div>
  );
}