// src/components/ShareResultsModal.tsx
import { X, FileText } from "lucide-react";
import type { LabExamFormData } from "../types";
import { useRef } from "react";

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
    mainVet: string; // ✅ ya viene del paciente
    refVet: string;
  };
}

export default function ShareResultsModal({
  isOpen,
  onClose,
  examData,
  patientData,
}: ShareResultsModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const cells = examData.differentialCount;
  const totalCells = examData.totalCells;
  const date = new Date(examData.date).toLocaleDateString('es-ES');

  const calculatePercentage = (count: number) => {
    return totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : "0.0";
  };

  const calculateAbsolute = (percentage: number) => {
    const abs = (percentage / 100) * examData.whiteBloodCells;
    const exp = Math.floor(Math.log10(abs)) || 0;
    const base = parseFloat((abs / Math.pow(10, exp)).toFixed(1));
    return `${base} x10${exp > 0 ? `⁰${exp}` : '⁰'} /μL`;
  };

  const handlePrintPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hematología - ${patientData.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px;
              color: #333;
            }
            h1 { 
              text-align: center; 
              color: #2c3e50;
              margin-bottom: 30px;
              font-size: 24px;
            }
            .info-section {
              margin-bottom: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .info-row {
              margin: 5px 0;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            h2 {
              background: #2980b9;
              color: white;
              padding: 10px;
              margin: 20px 0 10px 0;
              border-radius: 5px;
              font-size: 16px;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 12px;
            }
            th {
              background: #2980b9;
              color: white;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              border: 1px solid #2980b9;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .param-name {
              text-align: left;
              font-weight: bold;
              background: #ecf0f1;
            }
            .notes-section {
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-left: 4px solid #3498db;
              border-radius: 0 8px 8px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .footer p {
                margin: 2px 0;
            }
            @media print {
              body { padding: 20px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body onload="window.print()">
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-space-navy/95 border-2 border-coral-pulse/30 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute -inset-2 bg-gradient-to-r from-coral-pulse/20 via-electric-mint/20 to-coral-pulse/20 rounded-3xl blur-xl opacity-50" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Examen Guardado ✅
              </h2>
              <p className="text-misty-lilac/70 text-sm">
                Imprimir PDF o compartir por WhatsApp
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-misty-lilac/50 hover:text-misty-lilac transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* PDF Preview Content - Hidden but printable */}
          <div ref={printRef} className="hidden">
            <h1>RESULTADOS DE HEMATOLOGÍA</h1>
            
            <div className="info-section">
              <div className="info-row"><span className="info-label">Fecha:</span> {date}</div>
              <div className="info-row"><span className="info-label">Paciente:</span> {patientData.name}</div>
              <div className="info-row"><span className="info-label">Especie:</span> {patientData.species}</div>
              <div className="info-row"><span className="info-label">Propietario:</span> {patientData.owner.name}</div>
              <div className="info-row"><span className="info-label">Médico responsable:</span> {patientData.refVet}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th rowSpan={2}>PARÁMETRO</th>
                  <th rowSpan={2}>RESULTADO</th>
                  <th rowSpan={2}>UNID</th>
                  <th colSpan={2}>Valores Referenciales</th>
                </tr>
                <tr>
                  <th>CANINO</th>
                  <th>FELINO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="param-name">Hematocrito</td>
                  <td>{examData.hematocrit}</td>
                  <td>%</td>
                  <td>37-55</td>
                  <td>30-45</td>
                </tr>
                <tr>
                  <td className="param-name">Glóbulos Blancos</td>
                  <td>{examData.whiteBloodCells}</td>
                  <td>MM3</td>
                  <td>6000-17000</td>
                  <td>5000-19000</td>
                </tr>
                <tr>
                  <td className="param-name">Plaquetas</td>
                  <td>{examData.platelets}</td>
                  <td>MM3</td>
                  <td>200000-400000</td>
                  <td>300000-500000</td>
                </tr>
                <tr>
                  <td className="param-name">Proteínas Totales</td>
                  <td>{examData.totalProtein}</td>
                  <td>GR/DL</td>
                  <td>5.3-7.9</td>
                  <td>5.7-8.0</td>
                </tr>
              </tbody>
            </table>

            <h2>Fórmula Leucocitaria</h2>
            <table>
              <thead>
                <tr>
                  <th>CÉLULA</th>
                  <th>%</th>
                  <th>ABSOLUTO</th>
                  <th>CANINO (%)</th>
                  <th>FELINO (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="param-name">Neutrófilos Seg</td>
                  <td>{neutrofilosSegPer}%</td>
                  <td>{calculateAbsolute(Number(neutrofilosSegPer))}</td>
                  <td>60-77</td>
                  <td>35-75</td>
                </tr>
                <tr>
                  <td className="param-name">Neutrófilos Bandas</td>
                  <td>{neutrofilosBandPer}%</td>
                  <td>{calculateAbsolute(Number(neutrofilosBandPer))}</td>
                  <td>0-3</td>
                  <td>0-3</td>
                </tr>
                <tr>
                  <td className="param-name">Linfocitos</td>
                  <td>{linfocitosPer}%</td>
                  <td>{calculateAbsolute(Number(linfocitosPer))}</td>
                  <td>12-30</td>
                  <td>20-55</td>
                </tr>
                <tr>
                  <td className="param-name">Monocitos</td>
                  <td>{monocitosPer}%</td>
                  <td>{calculateAbsolute(Number(monocitosPer))}</td>
                  <td>3-10</td>
                  <td>1-4</td>
                </tr>
                <tr>
                  <td className="param-name">Eosinófilos</td>
                  <td>{eosinofilosPer}%</td>
                  <td>{calculateAbsolute(Number(eosinofilosPer))}</td>
                  <td>2-10</td>
                  <td>2-12</td>
                </tr>
                <tr>
                  <td className="param-name">Basófilos</td>
                  <td>{basofilosPer}%</td>
                  <td>{calculateAbsolute(Number(basofilosPer))}</td>
                  <td>Raros</td>
                  <td>Raros</td>
                </tr>
              </tbody>
            </table>

            {/* ✅ Sección de hallazgos (solo si existen) */}
            {(examData.hemotropico || examData.observacion) && (
              <div className="notes-section">
                {examData.hemotropico && (
                  <div className="info-row">
                    <span className="info-label">Hallazgos hemotrópicos:</span> {examData.hemotropico}
                  </div>
                )}
                {examData.observacion && (
                  <div className="info-row">
                    <span className="info-label">Observaciones:</span> {examData.observacion}
                  </div>
                )}
              </div>
            )}

            <div className="footer">
                <p><b>{patientData.mainVet}</b></p>
                <p>C.I: 12.345.678 | CMV: 6543 | RUNSAI: 9876 | MSDS: 5555</p>
                <br />
                <p style={{fontStyle: 'italic'}}>Para cualquier consulta sobre estos resultados, no dude en contactarnos.</p>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="bg-space-navy/60 border border-electric-mint/20 rounded-2xl p-4 mb-6 max-h-96 overflow-y-auto">
            <p className="text-xs text-misty-lilac/70 mb-3">Vista previa del PDF:</p>
            <div className="text-xs text-white space-y-2">
              <p className="font-bold text-electric-mint">📊 HEMATOLOGÍA - {patientData.name}</p>
              <p>Fecha: {date} | Especie: {patientData.species}</p>
              <p className="text-misty-lilac/80">Médico responsable: {patientData.refVet}</p>
              
              <div className="mt-2 space-y-1">
                <p>• Hematocrito: {examData.hematocrit}%</p>
                <p>• Leucocitos: {examData.whiteBloodCells} MM³</p>
                <p>• Plaquetas: {examData.platelets} MM³</p>
                <p>• Proteínas: {examData.totalProtein} g/dL</p>
              </div>

              {/* ✅ Mostrar hemotrópico y observación con mejor diseño */}
              {(examData.hemotropico || examData.observacion) && (
                <div className="mt-3 pt-2 border-t border-coral-pulse/20">
                  {examData.hemotropico && (
                    <div className="flex items-start gap-2">
                      <span className="text-coral-pulse font-bold">🩸</span>
                      <span className="text-coral-pulse/90">{examData.hemotropico}</span>
                    </div>
                  )}
                  {examData.observacion && (
                    <div className="flex items-start gap-2 mt-1">
                      <span className="text-electric-mint font-bold">📝</span>
                      <span className="text-electric-mint/90">{examData.observacion}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handlePrintPDF}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-coral-pulse/20 to-coral-pulse/30 border-2 border-coral-pulse/40 rounded-xl px-6 py-4 text-white hover:scale-105 transition-all duration-300"
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Generar PDF (Imprimir o Guardar)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 bg-electric-mint/10 border-2 border-electric-mint/30 rounded-xl px-6 py-4 text-misty-lilac hover:bg-electric-mint/20 transition-all duration-300"
            >
              <span className="font-semibold">Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}