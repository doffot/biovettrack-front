// src/components/recipes/RecipePrintModal.tsx
import { Printer, Download, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import html2pdf from "html2pdf.js";
import { toast } from "../Toast";
import type { Recipe } from "../../types/recipe";

interface RecipePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  patientData: {
    name: string;
    species: string;
    breed?: string;
    owner: { name: string };
  };
}

export default function RecipePrintModal({
  isOpen,
  onClose,
  recipe,
  patientData,
}: RecipePrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [action, setAction] = useState<"print" | "download" | null>(null);
  const { data: authUser } = useAuth();

  if (!isOpen) return null;

  const date = new Date(recipe.issueDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getVetFullName = (): string => {
    if (!authUser) return "Médico Veterinario";
    return `Dr(a). ${authUser.name || ""} ${authUser.lastName || ""}`.trim();
  };

  // HTML del documento
  const generateHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receta - ${patientData.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 12mm; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1A3E4A;
          font-size: 11px;
          padding: 10mm 12mm;
          background: white;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #6366F1;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .header h1 {
          color: #6366F1;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .header .subtitle {
          color: #5A7C88;
          font-size: 11px;
          margin-top: 4px;
        }
        .info-section {
          margin-bottom: 16px;
          padding: 12px 16px;
          background-color: #F0F4FF;
          border-radius: 8px;
          border: 1px solid #E0E7FF;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px 20px;
        }
        .info-item {
          font-size: 10px;
        }
        .info-item .label {
          font-weight: 600;
          color: #4338CA;
        }
        .info-item .value {
          color: #1A3E4A;
        }
        .section-title {
          background: linear-gradient(135deg, #6366F1 0%, #4338CA 100%);
          color: white;
          padding: 8px 16px;
          margin-bottom: 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .medication-card {
          padding: 14px 16px;
          margin-bottom: 12px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: white;
          page-break-inside: avoid;
        }
        .medication-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #E5E7EB;
        }
        .medication-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #6366F1;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
          margin-right: 10px;
        }
        .medication-name {
          font-size: 14px;
          font-weight: 700;
          color: #1A3E4A;
        }
        .medication-presentation {
          font-size: 11px;
          color: #5A7C88;
          margin-top: 2px;
        }
        .medication-source {
          font-size: 9px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
        }
        .source-farmacia {
          background-color: #DBEAFE;
          color: #1E40AF;
        }
        .source-veterinario {
          background-color: #D1FAE5;
          color: #065F46;
        }
        .medication-quantity {
          font-size: 11px;
          color: #374151;
          margin-bottom: 8px;
        }
        .medication-quantity span {
          font-weight: 600;
        }
        .instructions-box {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 10px 12px;
          border-radius: 0 6px 6px 0;
        }
        .instructions-title {
          font-weight: 700;
          color: #92400E;
          font-size: 10px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .instructions-text {
          color: #78350F;
          font-size: 11px;
          line-height: 1.5;
        }
        .notes-section {
          margin-top: 16px;
          padding: 12px 16px;
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          border-radius: 0 8px 8px 0;
        }
        .notes-title {
          font-weight: 700;
          color: #92400E;
          font-size: 11px;
          margin-bottom: 4px;
        }
        .notes-text {
          color: #78350F;
          font-size: 11px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 16px;
          border-top: 2px solid #E0E7FF;
          text-align: center;
        }
        .vet-name {
          font-weight: 700;
          color: #6366F1;
          font-size: 14px;
        }
        .vet-title {
          color: #5A7C88;
          font-size: 10px;
          margin-top: 2px;
        }
        .vet-credentials {
          color: #5A7C88;
          font-size: 9px;
          margin-top: 8px;
        }
        .disclaimer {
          margin-top: 12px;
          padding: 8px 12px;
          background-color: #F3F4F6;
          border-radius: 6px;
          font-size: 8px;
          color: #6B7280;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 RECETA MÉDICA VETERINARIA</h1>
        <p class="subtitle">Prescripción de medicamentos</p>
      </div>
      
      <div class="info-section">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">📅 Fecha:</span>
            <span class="value">${date}</span>
          </div>
          <div class="info-item">
            <span class="label">🐾 Paciente:</span>
            <span class="value">${patientData.name}</span>
          </div>
          <div class="info-item">
            <span class="label">🏷️ Especie:</span>
            <span class="value">${patientData.species}${patientData.breed ? ` - ${patientData.breed}` : ""}</span>
          </div>
          <div class="info-item">
            <span class="label">👤 Propietario:</span>
            <span class="value">${patientData.owner.name}</span>
          </div>
        </div>
      </div>
      
      <div class="section-title">💊 Medicamentos Recetados (${recipe.medications.length})</div>
      
      ${recipe.medications
        .map(
          (med, index) => `
        <div class="medication-card">
          <div class="medication-header">
            <div style="display: flex; align-items: flex-start;">
              <span class="medication-number">${index + 1}</span>
              <div>
                <div class="medication-name">${med.name}</div>
                <div class="medication-presentation">${med.presentation}</div>
              </div>
            </div>
            <span class="medication-source ${med.source === "veterinario" ? "source-veterinario" : "source-farmacia"}">
              ${med.source === "veterinario" ? "🏥 Veterinaria" : "💊 Farmacia"}
            </span>
          </div>
          
          ${med.quantity ? `<div class="medication-quantity">📦 <span>Cantidad:</span> ${med.quantity}</div>` : ""}
          
          <div class="instructions-box">
            <div class="instructions-title">📋 Indicaciones</div>
            <div class="instructions-text">${med.instructions}</div>
          </div>
        </div>
      `
        )
        .join("")}
      
      ${
        recipe.notes
          ? `
        <div class="notes-section">
          <div class="notes-title">⚠️ Notas Adicionales</div>
          <div class="notes-text">${recipe.notes}</div>
        </div>
      `
          : ""
      }
      
      <div class="footer">
        <div class="vet-name">${getVetFullName()}</div>
        <div class="vet-title">Médico Veterinario</div>
        <div class="vet-credentials">
          C.I: 15.261.220 | CMV: 1833 | INSAI: 733116117279 | MSDS: 7642
        </div>
        <div class="disclaimer">
          Esta receta es válida únicamente para el paciente indicado. 
          Ante cualquier reacción adversa, suspenda el tratamiento y consulte inmediatamente.
        </div>
      </div>
    </body>
    </html>
  `;

  // Imprimir
  const handlePrint = () => {
    setIsGenerating(true);
    setAction("print");

    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:absolute;top:-10000px;left:-10000px;width:210mm;height:297mm;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Error al crear documento");

      iframeDoc.open();
      iframeDoc.write(generateHTML());
      iframeDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            setIsGenerating(false);
            setAction(null);
            onClose();
            toast.success("Listo", "Documento enviado a impresión");
          }, 500);
        }, 250);
      };
    } catch (error) {
      console.error("Error:", error);
      setIsGenerating(false);
      setAction(null);
      toast.error("Error", "No se pudo imprimir");
    }
  };

  // Descargar PDF
  const handleDownload = async () => {
    setIsGenerating(true);
    setAction("download");

    try {
      const container = document.createElement("div");
      container.innerHTML = generateHTML();
      container.style.cssText = "position:absolute;left:-9999px;top:0;width:210mm;";
      document.body.appendChild(container);

      const filename = `Receta_${patientData.name}_${new Date().toISOString().split("T")[0]}.pdf`;

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, width: 794, windowWidth: 794 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container.querySelector("body") || container)
        .save();

      document.body.removeChild(container);
      onClose();
      toast.success("PDF Descargado", filename);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", "No se pudo generar el PDF");
    } finally {
      setIsGenerating(false);
      setAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-5">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-bold text-white">Receta Lista</h2>
          <p className="text-xs text-white/80">
            {patientData.name} • {recipe.medications.length} medicamento
            {recipe.medications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 text-center">
          <p className="text-sm text-slate-600">¿Qué deseas hacer?</p>
          <p className="mt-1 text-xs text-slate-400">{date}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {isGenerating && action === "print" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Abriendo...</span>
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                <span>Imprimir</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-white py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-60"
          >
            {isGenerating && action === "download" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}