// src/components/ShareResultsModal.tsx
import { X, FileText, Printer, CheckCircle2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import html2pdf from "html2pdf.js";
import type { LabExamFormData } from "../types";

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: LabExamFormData;
  patientData: {
    name: string;
    species: string;
    owner: {
      name: string;
      contact: string;
    };
    mainVet: string;
    refVet: string;
  };
}

// Rangos normales en células/µL completas
const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6000, 17000],
    totalProtein: [5.4, 7.8],
    platelets: [200000, 500000],
    segmentedNeutrophills: [60, 77],
    bandNeutrophils: [0, 3],
    lymphocytes: [12, 30],
    monocytes: [3, 10],
    eosinophils: [2, 10],
    basophils: [0, 0],
  },
  felino: {
    hematocrit: [30, 45],
    whiteBloodCells: [5000, 19500],
    totalProtein: [5.7, 8.9],
    platelets: [300000, 800000],
    segmentedNeutrophills: [35, 75],
    bandNeutrophills: [0, 3],
    lymphocytes: [20, 55],
    monocytes: [1, 4],
    eosinophils: [2, 12],
    basophils: [0, 0],
  },
};

export default function ShareResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareResultsModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Obtener veterinario autenticado
  const { data: authUser } = useAuth();

  if (!isOpen) return null;

  const cells = examData.differentialCount;
  const totalCells = examData.totalCells;
  const date = new Date(examData.date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Formatear nombre completo del veterinario autenticado
  const getVetFullName = (): string => {
    if (!authUser) return "Médico Veterinario";
    const name = authUser.name || "";
    const lastName = authUser.lastName || "";
    return `Dr(a). ${name} ${lastName}`.trim();
  };

  const wbcDisplay = examData.whiteBloodCells.toLocaleString("es-ES");
  const plateletsDisplay = examData.platelets.toLocaleString("es-ES");

  const calculatePercentage = (count: number) => {
    return totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : "0.0";
  };

  const calculateAbsolute = (percentage: number) => {
    const abs = (percentage / 100) * examData.whiteBloodCells;
    return abs.toFixed(0);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString("es-ES");
  };

  // Generar PDF con html2pdf.js (funciona en móviles)
  const handlePrintPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      const filename = `Hematologia_${patientData.name}_${new Date().toISOString().split("T")[0]}.pdf`;

      const worker = html2pdf();

      worker
        .set({
          margin: [8, 8, 8, 8], // Márgenes simétricos en mm
          filename: filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0,
            width: 794, // A4 width @ 96dpi
            windowWidth: 794,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          // pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(element)
        .save()
        .then(() => {
          setIsGenerating(false);
        })
        .catch((error: Error) => {
          console.error("Error generando PDF:", error);
          alert("Error al generar el PDF. Por favor intenta de nuevo.");
          setIsGenerating(false);
        });
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor intenta de nuevo.");
      setIsGenerating(false);
    }
  };

  const neutrofilosSegPer = calculatePercentage(cells.segmentedNeutrophils || 0);
  const neutrofilosBandPer = calculatePercentage(cells.bandNeutrophils || 0);
  const linfocitosPer = calculatePercentage(cells.lymphocytes || 0);
  const monocitosPer = calculatePercentage(cells.monocytes || 0);
  const eosinofilosPer = calculatePercentage(cells.eosinophils || 0);
  const basofilosPer = calculatePercentage(cells.basophils || 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-vet-primary to-vet-secondary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-montserrat">
                Resultado de Laboratorio
              </h2>
              <p className="text-white/80 text-sm">Listo para imprimir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Content - Oculto pero renderizado para html2pdf */}
        <div style={{ position: "absolute", left: "-9999px", top: 0, width: "210mm" }}>
          <div
            ref={printRef}
            style={{
              width: "210mm",
              padding: "8mm 10mm",
              backgroundColor: "white",
              fontFamily: "'Segoe UI', Arial, sans-serif",
              color: "#1A3E4A",
              fontSize: "10px",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {/* Header del PDF - Compacto */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "2px solid #0A7EA4",
                paddingBottom: "8px",
                marginBottom: "10px",
              }}
            >
              <h1
                style={{
                  color: "#0A7EA4",
                  fontSize: "18px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                RESULTADOS DE HEMATOLOGÍA
              </h1>
              <p
                style={{
                  color: "#5A7C88",
                  fontSize: "10px",
                  margin: "2px 0 0 0",
                }}
              >
                Análisis Hematológico Completo
              </p>
            </div>

            {/* Info Section - Compacta */}
            <div
              style={{
                marginBottom: "10px",
                padding: "8px 12px",
                backgroundColor: "#E0F4F8",
                borderRadius: "6px",
                borderLeft: "3px solid #0A7EA4",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "4px 12px",
                }}
              >
                <div style={{ fontSize: "9px", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: "#085F7A" }}>Fecha:</span>{" "}
                  {date}
                </div>
                <div style={{ fontSize: "9px", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: "#085F7A" }}>Paciente:</span>{" "}
                  {patientData.name}
                </div>
                <div style={{ fontSize: "9px", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: "#085F7A" }}>Especie:</span>{" "}
                  {patientData.species}
                </div>
                <div style={{ fontSize: "9px", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: "#085F7A" }}>Raza:</span>{" "}
                  {examData.breed || "No especificado"}
                </div>
                <div style={{ fontSize: "9px", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: "#085F7A" }}>Propietario:</span>{" "}
                  {patientData.owner.name || "No especificado"}
                </div>
                <div style={{ fontSize: "9px", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, color: "#085F7A" }}>Médico Tratante:</span>{" "}
                  {examData.treatingVet || "No especificado"}
                </div>
              </div>
            </div>

            {/* Valores del Hemograma */}
            <div
              style={{
                background: "linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%)",
                color: "white",
                padding: "6px 12px",
                marginBottom: "6px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Valores del Hemograma
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "10px",
                fontSize: "9px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>PARÁMETRO</th>
                  <th style={thStyle}>RESULTADO</th>
                  <th style={thStyle}>UNIDAD</th>
                  <th style={thStyle}>REF. CANINO</th>
                  <th style={thStyle}>REF. FELINO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdParamStyle}>Hematocrito</td>
                  <td style={tdValueStyle}>{examData.hematocrit}</td>
                  <td style={tdStyle}>%</td>
                  <td style={tdStyle}>
                    {normalValues.canino.hematocrit[0]} - {normalValues.canino.hematocrit[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.hematocrit[0]} - {normalValues.felino.hematocrit[1]}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#FAFEFE" }}>
                  <td style={tdParamStyle}>Glóbulos Blancos</td>
                  <td style={tdValueStyle}>{wbcDisplay}</td>
                  <td style={tdStyle}>células/µL</td>
                  <td style={tdStyle}>
                    {formatNumber(normalValues.canino.whiteBloodCells[0])} -{" "}
                    {formatNumber(normalValues.canino.whiteBloodCells[1])}
                  </td>
                  <td style={tdStyle}>
                    {formatNumber(normalValues.felino.whiteBloodCells[0])} -{" "}
                    {formatNumber(normalValues.felino.whiteBloodCells[1])}
                  </td>
                </tr>
                <tr>
                  <td style={tdParamStyle}>Plaquetas</td>
                  <td style={tdValueStyle}>{plateletsDisplay}</td>
                  <td style={tdStyle}>células/µL</td>
                  <td style={tdStyle}>
                    {formatNumber(normalValues.canino.platelets[0])} -{" "}
                    {formatNumber(normalValues.canino.platelets[1])}
                  </td>
                  <td style={tdStyle}>
                    {formatNumber(normalValues.felino.platelets[0])} -{" "}
                    {formatNumber(normalValues.felino.platelets[1])}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#FAFEFE" }}>
                  <td style={tdParamStyle}>Proteínas Totales</td>
                  <td style={tdValueStyle}>{examData.totalProtein}</td>
                  <td style={tdStyle}>g/dL</td>
                  <td style={tdStyle}>
                    {normalValues.canino.totalProtein[0]} - {normalValues.canino.totalProtein[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.totalProtein[0]} - {normalValues.felino.totalProtein[1]}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Fórmula Leucocitaria */}
            <div
              style={{
                background: "linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%)",
                color: "white",
                padding: "6px 12px",
                marginBottom: "6px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Fórmula Leucocitaria
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "10px",
                fontSize: "9px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>TIPO CELULAR</th>
                  <th style={thStyle}>%</th>
                  <th style={thStyle}>ABSOLUTO (cél/µL)</th>
                  <th style={thStyle}>REF. CANINO (%)</th>
                  <th style={thStyle}>REF. FELINO (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdParamStyle}>Neutrófilos Segmentados</td>
                  <td style={tdValueStyle}>{neutrofilosSegPer}%</td>
                  <td style={tdStyle}>{calculateAbsolute(Number(neutrofilosSegPer))}</td>
                  <td style={tdStyle}>
                    {normalValues.canino.segmentedNeutrophills[0]} - {normalValues.canino.segmentedNeutrophills[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.segmentedNeutrophills[0]} - {normalValues.felino.segmentedNeutrophills[1]}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#FAFEFE" }}>
                  <td style={tdParamStyle}>Neutrófilos en Banda</td>
                  <td style={tdValueStyle}>{neutrofilosBandPer}%</td>
                  <td style={tdStyle}>{calculateAbsolute(Number(neutrofilosBandPer))}</td>
                  <td style={tdStyle}>
                    {normalValues.canino.bandNeutrophils[0]} - {normalValues.canino.bandNeutrophils[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.bandNeutrophills[0]} - {normalValues.felino.bandNeutrophills[1]}
                  </td>
                </tr>
                <tr>
                  <td style={tdParamStyle}>Linfocitos</td>
                  <td style={tdValueStyle}>{linfocitosPer}%</td>
                  <td style={tdStyle}>{calculateAbsolute(Number(linfocitosPer))}</td>
                  <td style={tdStyle}>
                    {normalValues.canino.lymphocytes[0]} - {normalValues.canino.lymphocytes[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.lymphocytes[0]} - {normalValues.felino.lymphocytes[1]}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#FAFEFE" }}>
                  <td style={tdParamStyle}>Monocitos</td>
                  <td style={tdValueStyle}>{monocitosPer}%</td>
                  <td style={tdStyle}>{calculateAbsolute(Number(monocitosPer))}</td>
                  <td style={tdStyle}>
                    {normalValues.canino.monocytes[0]} - {normalValues.canino.monocytes[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.monocytes[0]} - {normalValues.felino.monocytes[1]}
                  </td>
                </tr>
                <tr>
                  <td style={tdParamStyle}>Eosinófilos</td>
                  <td style={tdValueStyle}>{eosinofilosPer}%</td>
                  <td style={tdStyle}>{calculateAbsolute(Number(eosinofilosPer))}</td>
                  <td style={tdStyle}>
                    {normalValues.canino.eosinophils[0]} - {normalValues.canino.eosinophils[1]}
                  </td>
                  <td style={tdStyle}>
                    {normalValues.felino.eosinophils[0]} - {normalValues.felino.eosinophils[1]}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#FAFEFE" }}>
                  <td style={tdParamStyle}>Basófilos</td>
                  <td style={tdValueStyle}>{basofilosPer}%</td>
                  <td style={tdStyle}>{calculateAbsolute(Number(basofilosPer))}</td>
                  <td style={tdStyle}>Raros</td>
                  <td style={tdStyle}>Raros</td>
                </tr>
              </tbody>
            </table>

            {/* Notas si existen */}
            {(examData.hemotropico || examData.observacion) && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "8px 12px",
                  backgroundColor: "#E0F4F8",
                  borderLeft: "3px solid #36BCD4",
                  borderRadius: "0 6px 6px 0",
                  fontSize: "9px",
                }}
              >
                {examData.hemotropico && (
                  <div style={{ marginBottom: examData.observacion ? "6px" : "0" }}>
                    <span style={{ fontWeight: 700, color: "#085F7A" }}>
                      Hallazgos Hemotrópicos:{" "}
                    </span>
                    <span style={{ color: "#1A3E4A" }}>{examData.hemotropico}</span>
                  </div>
                )}
                {examData.observacion && (
                  <div>
                    <span style={{ fontWeight: 700, color: "#085F7A" }}>
                      Observaciones:{" "}
                    </span>
                    <span style={{ color: "#1A3E4A" }}>{examData.observacion}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer - sin marginTop: auto */}
            <div
              style={{
                paddingTop: "10px",
                borderTop: "1px solid #E0F4F8",
                textAlign: "center",
                color: "#5A7C88",
                fontSize: "9px",
                marginTop: "10px",
              }}
            >
              <p style={{ fontWeight: 700, color: "#0A7EA4", fontSize: "11px", margin: "0 0 3px 0" }}>
                {getVetFullName()}
              </p>
              <p style={{ margin: "2px 0" }}>
                C.I: 15.261.220 | CMV: 1833 | INSAI: 733116117279 | MSDS: 7642
              </p>
              <p style={{ fontStyle: "italic", margin: "4px 0 0 0", fontSize: "8px" }}>
                Para cualquier consulta sobre estos resultados, no dude en contactarnos.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="p-6 space-y-4">
          {/* Info del examen */}
          <div className="bg-gradient-to-br from-vet-light/50 to-white border border-vet-primary/20 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-vet-muted font-medium">Paciente</p>
                <p className="text-sm font-bold text-vet-text">{patientData.name}</p>
              </div>
              <div>
                <p className="text-xs text-vet-muted font-medium">Especie</p>
                <p className="text-sm font-bold text-vet-text capitalize">{patientData.species}</p>
              </div>
              <div>
                <p className="text-xs text-vet-muted font-medium">Fecha</p>
                <p className="text-sm font-bold text-vet-text">{date}</p>
              </div>
            </div>
          </div>

          {/* Quick values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">Hematocrito</p>
              <p className="text-xl font-bold text-vet-primary">{examData.hematocrit}%</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">Leucocitos</p>
              <p className="text-xl font-bold text-vet-primary">{wbcDisplay}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">Plaquetas</p>
              <p className="text-xl font-bold text-vet-primary">{plateletsDisplay}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">Proteínas</p>
              <p className="text-xl font-bold text-vet-primary">{examData.totalProtein}</p>
            </div>
          </div>

          {/* Notas si existen */}
          {(examData.hemotropico || examData.observacion) && (
            <div className="space-y-3">
              {examData.hemotropico && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-bold text-blue-800 mb-1">Hallazgos Hemotrópicos</p>
                  <p className="text-sm text-blue-900">{examData.hemotropico}</p>
                </div>
              )}
              {examData.observacion && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-800 mb-1">Observaciones Clínicas</p>
                  <p className="text-sm text-amber-900">{examData.observacion}</p>
                </div>
              )}
            </div>
          )}

          {/* Success message */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800">
              Examen guardado correctamente. Puedes generar el PDF ahora.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handlePrintPDF}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl px-6 py-3 transition-all duration-300 shadow-lg shadow-vet-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" />
                <span>Generar PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos reutilizables para tablas (definidos fuera del render para evitar recreación)
const thStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%)",
  color: "white",
  padding: "5px 4px",
  textAlign: "center",
  fontWeight: 600,
  border: "1px solid #0A7EA4",
  fontSize: "8px",
  textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #E0F4F8",
  textAlign: "center",
  fontSize: "9px",
};

const tdParamStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #E0F4F8",
  textAlign: "left",
  fontWeight: 600,
  backgroundColor: "#F0F9FB",
  color: "#085F7A",
};

const tdValueStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #E0F4F8",
  textAlign: "center",
  fontWeight: 700,
  color: "#0A7EA4",
  fontSize: "9px",
};