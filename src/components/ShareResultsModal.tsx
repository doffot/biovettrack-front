import { Printer } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../api/AuthAPI";
import html2pdf from "html2pdf.js";
import { toast } from "./Toast";
import type { LabExam } from "../types";
import ConfirmationModal from "./modal/ConfirmationModal";

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData: LabExam;
  patientData: {
    name: string;
    species: string;
    breed?: string;
    owner: { name?: string; contact?: string };
    mainVet?: string;
    refVet?: string;
  };
}

export default function ShareResultsModal({ isOpen, onClose, examData, patientData }: ShareResultsModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // Cargar firma como Base64 si existe
  useEffect(() => {
    const loadSignature = async () => {
      if (!profile?.signature) return;
      
      try {
        const response = await fetch(profile.signature);
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

    if (isOpen && profile?.signature) {
      loadSignature();
    }
  }, [isOpen, profile?.signature]);

  const cells = examData.differentialCount;
  
  const calculatePercentage = (count: number) => 
    examData.totalCells > 0 ? ((count / examData.totalCells) * 100).toFixed(1) : "0.0";
  
  const calculateAbsolute = (percentage: string) => 
    ((parseFloat(percentage) / 100) * examData.whiteBloodCells).toFixed(0);

  const formatNumber = (num: number) => num.toLocaleString("es-ES");

  const handlePrintPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    setIsGenerating(true);
    try {
      const filename = `Hematologia_${patientData.name}.pdf`;
      await html2pdf().set({
        margin: [10, 0, 10, 0],
        filename,
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          letterRendering: true 
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(element).save();
      onClose();
      toast.success("PDF Generado correctamente");
    } catch (error) {
      toast.error("Error al generar PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const thStyle: React.CSSProperties = { background: "#0A7EA4", color: "white", padding: "8px", fontSize: "10px", textAlign: "center", border: "1px solid #E2E8F0" };
  const tdStyle: React.CSSProperties = { padding: "8px", border: "1px solid #E2E8F0", textAlign: "center", fontSize: "11px", color: "#1e293b" };
  const labelStyle: React.CSSProperties = { textAlign: "left", fontWeight: "bold", backgroundColor: "#f8fafc" };

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handlePrintPDF}
        variant="info"
        title="¡Examen Guardado!"
        message={
          <div className="text-center">
            <p className="text-lg font-bold text-slate-200 uppercase tracking-tight">
              {patientData.name} • {patientData.species}
            </p>
            <div className="py-3 border-y border-slate-700/50 my-4">
              <p className="text-slate-400 font-medium">Resultados listos para descargar</p>
              <p className="text-sm text-slate-500 mt-1">{new Date(examData.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        }
        confirmText="Descargar PDF"
        confirmIcon={Printer}
        isLoading={isGenerating}
      />

      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={printRef} style={{ 
          width: "210mm", 
          minHeight: "297mm",
          padding: "15mm 20mm",
          backgroundColor: "white", 
          fontFamily: "sans-serif",
          boxSizing: "border-box"
        }}>
          
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <h1 style={{ color: "#0A7EA4", fontSize: "24px", margin: "0 0 5px 0", letterSpacing: "1px" }}>RESULTADOS DE HEMATOLOGÍA</h1>
            <p style={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Análisis Hematológico Completo</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", backgroundColor: "#E0F4F8", padding: "15px", borderRadius: "8px", marginBottom: "20px", fontSize: "11px" }}>
            <div><strong>Fecha:</strong> {new Date(examData.date).toLocaleDateString()}</div>
            <div><strong>Paciente:</strong> {patientData.name}</div>
            <div><strong>Especie:</strong> {patientData.species}</div>
            <div><strong>Raza:</strong> {patientData.breed || "—"}</div>
            <div><strong>Propietario:</strong> {patientData.owner.name || "—"}</div>
            <div><strong>Médico Tratante:</strong> {patientData.mainVet || "—"}</div>
          </div>

          <div style={{ background: "#0A7EA4", color: "white", padding: "8px", textAlign: "center", fontWeight: "bold", borderRadius: "4px 4px 0 0", fontSize: "12px", textTransform: "uppercase" }}>Valores del Hemograma</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px" }}>
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
              <tr><td style={{ ...tdStyle, ...labelStyle }}>Hematocrito</td><td style={{ ...tdStyle, fontWeight: "bold" }}>{examData.hematocrit}</td><td style={tdStyle}>%</td><td style={tdStyle}>37 - 55</td><td style={tdStyle}>30 - 45</td></tr>
              <tr><td style={{ ...tdStyle, ...labelStyle }}>Glóbulos Blancos</td><td style={{ ...tdStyle, fontWeight: "bold" }}>{formatNumber(examData.whiteBloodCells)}</td><td style={tdStyle}>células/µL</td><td style={tdStyle}>6.000 - 17.000</td><td style={tdStyle}>5.000 - 19.500</td></tr>
              <tr><td style={{ ...tdStyle, ...labelStyle }}>Plaquetas</td><td style={{ ...tdStyle, fontWeight: "bold" }}>{formatNumber(examData.platelets)}</td><td style={tdStyle}>células/µL</td><td style={tdStyle}>200.000 - 500.000</td><td style={tdStyle}>300.000 - 800.000</td></tr>
              <tr><td style={{ ...tdStyle, ...labelStyle }}>Proteínas Totales</td><td style={{ ...tdStyle, fontWeight: "bold" }}>{examData.totalProtein}</td><td style={tdStyle}>g/dL</td><td style={tdStyle}>5.4 - 7.8</td><td style={tdStyle}>5.7 - 8.9</td></tr>
            </tbody>
          </table>

          <div style={{ background: "#0A7EA4", color: "white", padding: "8px", textAlign: "center", fontWeight: "bold", borderRadius: "4px 4px 0 0", fontSize: "12px", textTransform: "uppercase" }}>Fórmula Leucocitaria</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>TIPO CELULAR</th>
                <th style={thStyle}>%</th>
                <th style={thStyle}>ABSOLUTO (CÉL/ML)</th>
                <th style={thStyle}>REF. CANINO (%)</th>
                <th style={thStyle}>REF. FELINO (%)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Neutrófilos Segmentados", val: cells.segmentedNeutrophils, refC: "60 - 77", refF: "35 - 75" },
                { label: "Neutrófilos en Banda", val: cells.bandNeutrophils, refC: "0 - 3", refF: "0 - 3" },
                { label: "Linfocitos", val: cells.lymphocytes, refC: "12 - 30", refF: "20 - 55" },
                { label: "Monocitos", val: cells.monocytes, refC: "3 - 10", refF: "1 - 4" },
                { label: "Eosinófilos", val: cells.eosinophils, refC: "2 - 10", refF: "2 - 12" },
                { label: "Basófilos", val: cells.basophils, refC: "Raros", refF: "Raros" },
              ].map((item) => {
                const per = calculatePercentage(item.val || 0);
                return (
                  <tr key={item.label}>
                    <td style={{ ...tdStyle, ...labelStyle }}>{item.label}</td>
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>{per}%</td>
                    <td style={tdStyle}>{calculateAbsolute(per)}</td>
                    <td style={tdStyle}>{item.refC}</td>
                    <td style={tdStyle}>{item.refF}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* PIE DE PÁGINA CON FIRMA */}
          <div style={{ marginTop: "50px", textAlign: "center", fontSize: "11px" }}>
            {/* Firma Digital */}
            {signatureBase64 && (
              <div style={{ 
                marginBottom: "10px",
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

            <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "10px", marginBottom: "10px" }}>
              <p style={{ fontWeight: "bold", margin: "0 0 5px 0", color: "#0A7EA4", fontSize: "14px" }}>
                Dr(a). {profile?.name} {profile?.lastName}
              </p>
              <p style={{ color: "#475569", margin: "2px 0" }}>
                C.I: {profile?.ci || "—"}
              </p>
            </div>

            <p style={{ color: "#475569", margin: "2px 0", lineHeight: "1.5" }}>
              COLVET-{profile?.estado || "—"}: {profile?.cmv || "—"} | <strong>INSAI:</strong> {profile?.runsai || "—"} | MSDS: {profile?.msds || "—"}
            </p>
            <p style={{ color: "#64748b", margin: "4px 0", fontWeight: "500" }}>
              {profile?.estado || "—"}, Venezuela
            </p>
            <p style={{ color: "#94a3b8", fontSize: "10px", fontStyle: "italic", marginTop: "15px", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
              "Para cualquier consulta sobre estos resultados, no dude en contactarnos."
            </p>
          </div>
        </div>
      </div>
    </>
  );
}