// src/components/recipes/RecipePrintModal.tsx
import { X, Download, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../api/AuthAPI";
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
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>("");
  
  // Obtener perfil completo del veterinario
  const { data: vetProfile } = useQuery({
    queryKey: ["vetProfile"],
    queryFn: getProfile,
  });

  // Cargar firma como Base64
  useEffect(() => {
    const loadSignature = async () => {
      if (!vetProfile?.signature) return;
      
      try {
        const response = await fetch(vetProfile.signature);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          setSignatureBase64(reader.result as string);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error cargando firma:", error);
      }
    };

    if (isOpen && vetProfile?.signature) {
      loadSignature();
    }
  }, [isOpen, vetProfile?.signature]);

  if (!isOpen) return null;

  const date = new Date(recipe.issueDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getVetFullName = (): string => {
    if (!vetProfile) return "Médico Veterinario";
    return `Dr(a). ${vetProfile.name} ${vetProfile.lastName}`.trim();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      const filename = `Receta_${patientData.name}_${new Date().toISOString().split("T")[0]}.pdf`;

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            allowTaint: true,
            width: 794, 
            windowWidth: 794 
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();

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

  const RecipeContent = () => (
    <div
      style={{
        width: "210mm",
        padding: "15mm 15mm",
        backgroundColor: "white",
        fontFamily: "'Times New Roman', serif",
        color: "#000",
        fontSize: "11pt",
        lineHeight: 1.6,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "15px", borderBottom: "2px solid #000" }}>
        <h1 style={{ fontSize: "18pt", fontWeight: "bold", margin: "0 0 5px 0", letterSpacing: "2px" }}>
          RECIPE
        </h1>
        <p style={{ fontSize: "10pt", margin: 0, color: "#333" }}>
          {getVetFullName()}
        </p>
        <p style={{ fontSize: "9pt", margin: "2px 0 0 0", color: "#666" }}>
          Médico Veterinario | COLVET-{vetProfile?.estado || ""}: {vetProfile?.cmv || ""}
        </p>
      </div>

      {/* Info del paciente */}
      <div style={{ marginBottom: "20px", fontSize: "10pt" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 0", width: "50%" }}>
                <strong>Fecha:</strong> {date}
              </td>
              <td style={{ padding: "4px 0" }}>
                <strong>Paciente:</strong> {patientData.name}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0" }}>
                <strong>Especie:</strong> {patientData.species}
                {patientData.breed ? ` (${patientData.breed})` : ""}
              </td>
              <td style={{ padding: "4px 0" }}>
                <strong>Propietario:</strong> {patientData.owner.name}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Separador */}
      <div style={{ borderTop: "1px solid #ccc", margin: "15px 0" }} />

      {/* Título Rp. (símbolo de receta) */}
      <div style={{ marginBottom: "15px" }}>
        <p style={{ fontSize: "14pt", fontWeight: "bold", margin: 0 }}>Rp.</p>
      </div>

      {/* Medicamentos */}
      <div style={{ marginBottom: "20px" }}>
        {recipe.medications.map((med, index) => (
          <div
            key={index}
            style={{
              marginBottom: "20px",
              paddingBottom: "15px",
              borderBottom: index < recipe.medications.length - 1 ? "1px dashed #ddd" : "none"
            }}
          >
            {/* Nombre con source */}
            <div style={{ marginBottom: "8px" }}>
              <p style={{ margin: 0, fontSize: "11pt" }}>
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  {index + 1}. {med.name}
                </span>
                {" "}
                <span style={{ color: "#777", fontWeight: "normal" }}>
                  ({med.source === "veterinario" ? "Uso veterinario" : "Farmacia"})
                </span>
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "10pt", color: "#555", fontStyle: "italic" }}>
                {med.presentation}
                {med.quantity && ` — ${med.quantity}`}
              </p>
            </div>

            {/* Indicaciones */}
            <div style={{ marginLeft: "15px", fontSize: "10pt" }}>
              <p style={{ margin: "5px 0 0 0" }}>
                <strong>Indicaciones:</strong> {med.instructions}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Notas */}
      {recipe.notes && (
        <div style={{ 
          marginTop: "15px", 
          padding: "12px", 
          backgroundColor: "#f9f9f9", 
          border: "1px solid #ddd",
          borderRadius: "4px"
        }}>
          <p style={{ margin: 0, fontSize: "10pt" }}>
            <strong>Nota:</strong> {recipe.notes}
          </p>
        </div>
      )}

      {/* Footer con firma */}
      <div style={{ marginTop: "40px", textAlign: "right" }}>
        <div style={{ display: "inline-block", textAlign: "center", minWidth: "200px" }}>
          
          {/* Firma Digital */}
          {signatureBase64 && (
            <div style={{ 
              marginBottom: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <img 
                src={signatureBase64} 
                alt="Firma del veterinario"
                crossOrigin="anonymous"
                style={{ 
                  height: "50px", 
                  width: "auto",
                  maxWidth: "180px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </div>
          )}
          
          <div style={{ borderTop: "1px solid #000", paddingTop: "8px", marginBottom: "5px" }}>
            <p style={{ margin: 0, fontSize: "10pt", fontWeight: "bold" }}>{getVetFullName()}</p>
            <p style={{ margin: "2px 0 0 0", fontSize: "9pt", color: "#666" }}>C.I: {vetProfile?.ci || ""}</p>
          </div>
        </div>
      </div>

      {/* Info adicional al pie */}
      <div style={{ 
        marginTop: "30px", 
        paddingTop: "15px", 
        borderTop: "1px solid #ccc",
        fontSize: "8pt",
        color: "#666",
        textAlign: "center"
      }}>
        <p style={{ margin: "0 0 3px 0" }}>
          C.I: {vetProfile?.ci || ""} | COLVET-{vetProfile?.estado || ""}: {vetProfile?.cmv || ""} | INSAI: {vetProfile?.runsai || "N/A"} | MSDS: {vetProfile?.msds || "N/A"}
        </p>
        <p style={{ margin: 0, fontStyle: "italic" }}>
          Esta receta es válida únicamente para el paciente indicado
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[95vh] overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-vet-primary to-vet-secondary">
          <h2 className="text-lg font-bold text-white">Vista Previa - Receta Médica</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido VISUAL */}
        <div className="flex-1 overflow-y-auto bg-slate-900 p-6">
          <div className="bg-slate-800 mx-auto p-8 rounded-xl border border-slate-700" style={{ maxWidth: "210mm" }}>
            
            <div className="text-center border-b-3 border-vet-accent pb-4 mb-6">
              <h1 className="text-2xl font-bold text-vet-accent mb-1">RECETA MÉDICA VETERINARIA</h1>
              <p className="text-sm text-vet-muted">Prescripción de medicamentos</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold text-vet-accent">Fecha:</span> <span className="text-vet-text">{date}</span></div>
              <div><span className="font-semibold text-vet-accent">Paciente:</span> <span className="text-vet-text">{patientData.name}</span></div>
              <div><span className="font-semibold text-vet-accent">Especie:</span> <span className="text-vet-text">{patientData.species}{patientData.breed ? ` - ${patientData.breed}` : ""}</span></div>
              <div><span className="font-semibold text-vet-accent">Propietario:</span> <span className="text-vet-text">{patientData.owner.name}</span></div>
            </div>

            <div className="bg-gradient-to-r from-vet-primary to-vet-secondary text-white px-4 py-2 rounded-lg mb-4">
              <h3 className="font-bold text-sm uppercase">Medicamentos Recetados ({recipe.medications.length})</h3>
            </div>

            <div className="space-y-4">
              {recipe.medications.map((med, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-4 bg-slate-800">
                  <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-700">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-7 h-7 bg-vet-primary text-white rounded-full text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-vet-text">{med.name}</p>
                        <p className="text-sm text-vet-muted">{med.presentation}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${med.source === "veterinario" ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700" : "bg-blue-900/30 text-blue-400 border border-blue-700"}`}>
                      {med.source === "veterinario" ? "Veterinaria" : "Farmacia"}
                    </span>
                  </div>
                  {med.quantity && (
                    <div className="text-sm text-vet-text mb-2">
                      Cantidad: <span className="font-semibold">{med.quantity}</span>
                    </div>
                  )}
                  <div className="bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg p-3">
                    <p className="text-xs font-bold text-amber-400 uppercase mb-1">Indicaciones</p>
                    <p className="text-sm text-amber-300">{med.instructions}</p>
                  </div>
                </div>
              ))}
            </div>

            {recipe.notes && (
              <div className="mt-6 bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg p-4">
                <p className="font-bold text-yellow-400 text-sm mb-1">Notas Adicionales</p>
                <p className="text-sm text-yellow-300">{recipe.notes}</p>
              </div>
            )}

            <div className="mt-8 pt-4 border-t-2 border-slate-700 text-center">
              {/* Vista previa de la firma */}
              {signatureBase64 && (
                <div className="flex justify-center mb-2">
                  <img 
                    src={signatureBase64} 
                    alt="Firma"
                    className="h-12 w-auto max-w-[180px] object-contain"
                  />
                </div>
              )}
              <p className="font-bold text-vet-accent text-lg">{getVetFullName()}</p>
              <p className="text-sm text-vet-muted">C.I: {vetProfile?.ci || ""}</p>
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-vet-muted italic">
                  Esta receta es válida únicamente para el paciente indicado.
                  Ante cualquier reacción adversa, suspenda el tratamiento y consulte inmediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800">
          <p className="text-sm text-vet-muted">Vista previa del documento a descargar</p>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 text-sm font-medium text-vet-muted hover:text-vet-text transition-colors disabled:opacity-50">
              Cerrar
            </button>
            <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex items-center gap-2 px-5 py-2 bg-vet-primary hover:bg-vet-secondary text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Oculto */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "210mm" }}>
        <div ref={printRef}>
          <RecipeContent />
        </div>
      </div>
    </div>
  );
}