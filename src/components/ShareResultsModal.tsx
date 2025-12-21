// src/components/ShareResultsModal.tsx
import {  Printer, CheckCircle2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import html2pdf from "html2pdf.js";
import { toast } from "./Toast"; // Tu componente
import type { LabExamFormData } from "../types";

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: LabExamFormData;
  patientData: {
    name: string;
    species: string;
    owner: { name: string; contact: string };
    mainVet: string;
    refVet: string;
  };
}

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
  const { data: authUser } = useAuth();

  if (!isOpen) return null;

  const cells = examData.differentialCount;
  const totalCells = examData.totalCells;
  const date = new Date(examData.date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getVetFullName = (): string => {
    if (!authUser) return "Médico Veterinario";
    return `Dr(a). ${authUser.name || ""} ${authUser.lastName || ""}`.trim();
  };

  const wbcDisplay = examData.whiteBloodCells.toLocaleString("es-ES");
  const plateletsDisplay = examData.platelets.toLocaleString("es-ES");

  const calculatePercentage = (count: number) =>
    totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : "0.0";

  const calculateAbsolute = (percentage: number) =>
    ((percentage / 100) * examData.whiteBloodCells).toFixed(0);

  const formatNumber = (num: number): string => num.toLocaleString("es-ES");

  const handlePrintPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      const filename = `Hematologia_${patientData.name}_${new Date().toISOString().split("T")[0]}.pdf`;

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, width: 794, windowWidth: 794 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();

      // Cerrar modal y mostrar toast de éxito
      onClose();
      toast.success(
        "PDF Descargado",
        `${filename} se guardó correctamente`,
        { duration: 4000 }
      );
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error(
        "Error al generar PDF",
        "Por favor intenta nuevamente",
        { duration: 5000 }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const neutrofilosSegPer = calculatePercentage(cells.segmentedNeutrophils || 0);
  const neutrofilosBandPer = calculatePercentage(cells.bandNeutrophils || 0);
  const linfocitosPer = calculatePercentage(cells.lymphocytes || 0);
  const monocitosPer = calculatePercentage(cells.monocytes || 0);
  const eosinofilosPer = calculatePercentage(cells.eosinophils || 0);
  const basofilosPer = calculatePercentage(cells.basophils || 0);

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Ultra Compacto */}
      <div className="relative z-10 w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center bg-gradient-to-r from-vet-primary to-vet-secondary px-4 py-5">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-white">¡Examen Guardado!</h2>
          <p className="text-xs text-white/80">{patientData.name} • {patientData.species}</p>
        </div>

        {/* Body */}
        <div className="p-4 text-center">
          <p className="text-sm text-slate-600">
            Resultados listos para descargar
          </p>
          <p className="mt-1 text-xs text-slate-400">{date}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrintPDF}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-vet-primary py-2.5 text-sm font-semibold text-white hover:bg-vet-secondary transition-colors disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PDF Oculto */}
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
          {/* Header del PDF */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #0A7EA4", paddingBottom: "8px", marginBottom: "10px" }}>
            <h1 style={{ color: "#0A7EA4", fontSize: "18px", fontWeight: 700, margin: 0 }}>RESULTADOS DE HEMATOLOGÍA</h1>
            <p style={{ color: "#5A7C88", fontSize: "10px", margin: "2px 0 0 0" }}>Análisis Hematológico Completo</p>
          </div>

          {/* Info Section */}
          <div style={{ marginBottom: "10px", padding: "8px 12px", backgroundColor: "#E0F4F8", borderRadius: "6px", borderLeft: "3px solid #0A7EA4" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 12px" }}>
              <div style={{ fontSize: "9px", lineHeight: 1.4 }}><span style={{ fontWeight: 600, color: "#085F7A" }}>Fecha:</span> {date}</div>
              <div style={{ fontSize: "9px", lineHeight: 1.4 }}><span style={{ fontWeight: 600, color: "#085F7A" }}>Paciente:</span> {patientData.name}</div>
              <div style={{ fontSize: "9px", lineHeight: 1.4 }}><span style={{ fontWeight: 600, color: "#085F7A" }}>Especie:</span> {patientData.species}</div>
              <div style={{ fontSize: "9px", lineHeight: 1.4 }}><span style={{ fontWeight: 600, color: "#085F7A" }}>Raza:</span> {examData.breed || "No especificado"}</div>
              <div style={{ fontSize: "9px", lineHeight: 1.4 }}><span style={{ fontWeight: 600, color: "#085F7A" }}>Propietario:</span> {patientData.owner.name || "No especificado"}</div>
              <div style={{ fontSize: "9px", lineHeight: 1.4 }}><span style={{ fontWeight: 600, color: "#085F7A" }}>Médico Tratante:</span> {examData.treatingVet || "No especificado"}</div>
            </div>
          </div>

          {/* Valores del Hemograma */}
          <div style={{ background: "linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%)", color: "white", padding: "6px 12px", marginBottom: "6px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, textAlign: "center" }}>
            Valores del Hemograma
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "9px" }}>
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
                <td style={tdStyle}>{normalValues.canino.hematocrit[0]} - {normalValues.canino.hematocrit[1]}</td>
                <td style={tdStyle}>{normalValues.felino.hematocrit[0]} - {normalValues.felino.hematocrit[1]}</td>
              </tr>
              <tr style={{ backgroundColor: "#FAFEFE" }}>
                <td style={tdParamStyle}>Glóbulos Blancos</td>
                <td style={tdValueStyle}>{wbcDisplay}</td>
                <td style={tdStyle}>células/µL</td>
                <td style={tdStyle}>{formatNumber(normalValues.canino.whiteBloodCells[0])} - {formatNumber(normalValues.canino.whiteBloodCells[1])}</td>
                <td style={tdStyle}>{formatNumber(normalValues.felino.whiteBloodCells[0])} - {formatNumber(normalValues.felino.whiteBloodCells[1])}</td>
              </tr>
              <tr>
                <td style={tdParamStyle}>Plaquetas</td>
                <td style={tdValueStyle}>{plateletsDisplay}</td>
                <td style={tdStyle}>células/µL</td>
                <td style={tdStyle}>{formatNumber(normalValues.canino.platelets[0])} - {formatNumber(normalValues.canino.platelets[1])}</td>
                <td style={tdStyle}>{formatNumber(normalValues.felino.platelets[0])} - {formatNumber(normalValues.felino.platelets[1])}</td>
              </tr>
              <tr style={{ backgroundColor: "#FAFEFE" }}>
                <td style={tdParamStyle}>Proteínas Totales</td>
                <td style={tdValueStyle}>{examData.totalProtein}</td>
                <td style={tdStyle}>g/dL</td>
                <td style={tdStyle}>{normalValues.canino.totalProtein[0]} - {normalValues.canino.totalProtein[1]}</td>
                <td style={tdStyle}>{normalValues.felino.totalProtein[0]} - {normalValues.felino.totalProtein[1]}</td>
              </tr>
            </tbody>
          </table>

          {/* Fórmula Leucocitaria */}
          <div style={{ background: "linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%)", color: "white", padding: "6px 12px", marginBottom: "6px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, textAlign: "center" }}>
            Fórmula Leucocitaria
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "9px" }}>
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
                <td style={tdStyle}>{normalValues.canino.segmentedNeutrophills[0]} - {normalValues.canino.segmentedNeutrophills[1]}</td>
                <td style={tdStyle}>{normalValues.felino.segmentedNeutrophills[0]} - {normalValues.felino.segmentedNeutrophills[1]}</td>
              </tr>
              <tr style={{ backgroundColor: "#FAFEFE" }}>
                <td style={tdParamStyle}>Neutrófilos en Banda</td>
                <td style={tdValueStyle}>{neutrofilosBandPer}%</td>
                <td style={tdStyle}>{calculateAbsolute(Number(neutrofilosBandPer))}</td>
                <td style={tdStyle}>{normalValues.canino.bandNeutrophils[0]} - {normalValues.canino.bandNeutrophils[1]}</td>
                <td style={tdStyle}>{normalValues.felino.bandNeutrophills[0]} - {normalValues.felino.bandNeutrophills[1]}</td>
              </tr>
              <tr>
                <td style={tdParamStyle}>Linfocitos</td>
                <td style={tdValueStyle}>{linfocitosPer}%</td>
                <td style={tdStyle}>{calculateAbsolute(Number(linfocitosPer))}</td>
                <td style={tdStyle}>{normalValues.canino.lymphocytes[0]} - {normalValues.canino.lymphocytes[1]}</td>
                <td style={tdStyle}>{normalValues.felino.lymphocytes[0]} - {normalValues.felino.lymphocytes[1]}</td>
              </tr>
              <tr style={{ backgroundColor: "#FAFEFE" }}>
                <td style={tdParamStyle}>Monocitos</td>
                <td style={tdValueStyle}>{monocitosPer}%</td>
                <td style={tdStyle}>{calculateAbsolute(Number(monocitosPer))}</td>
                <td style={tdStyle}>{normalValues.canino.monocytes[0]} - {normalValues.canino.monocytes[1]}</td>
                <td style={tdStyle}>{normalValues.felino.monocytes[0]} - {normalValues.felino.monocytes[1]}</td>
              </tr>
              <tr>
                <td style={tdParamStyle}>Eosinófilos</td>
                <td style={tdValueStyle}>{eosinofilosPer}%</td>
                <td style={tdStyle}>{calculateAbsolute(Number(eosinofilosPer))}</td>
                <td style={tdStyle}>{normalValues.canino.eosinophils[0]} - {normalValues.canino.eosinophils[1]}</td>
                <td style={tdStyle}>{normalValues.felino.eosinophils[0]} - {normalValues.felino.eosinophils[1]}</td>
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
            <div style={{ marginBottom: "10px", padding: "8px 12px", backgroundColor: "#E0F4F8", borderLeft: "3px solid #36BCD4", borderRadius: "0 6px 6px 0", fontSize: "9px" }}>
              {examData.hemotropico && (
                <div style={{ marginBottom: examData.observacion ? "6px" : "0" }}>
                  <span style={{ fontWeight: 700, color: "#085F7A" }}>Hallazgos Hemotrópicos: </span>
                  <span style={{ color: "#1A3E4A" }}>{examData.hemotropico}</span>
                </div>
              )}
              {examData.observacion && (
                <div>
                  <span style={{ fontWeight: 700, color: "#085F7A" }}>Observaciones: </span>
                  <span style={{ color: "#1A3E4A" }}>{examData.observacion}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ paddingTop: "10px", borderTop: "1px solid #E0F4F8", textAlign: "center", color: "#5A7C88", fontSize: "9px", marginTop: "10px" }}>
            <p style={{ fontWeight: 700, color: "#0A7EA4", fontSize: "11px", margin: "0 0 3px 0" }}>{getVetFullName()}</p>
            <p style={{ margin: "2px 0" }}>C.I: 15.261.220 | CMV: 1833 | INSAI: 733116117279 | MSDS: 7642</p>
            <p style={{ fontStyle: "italic", margin: "4px 0 0 0", fontSize: "8px" }}>Para cualquier consulta sobre estos resultados, no dude en contactarnos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}