// src/components/ShareResultsModal.tsx
import { X,  FileText, Printer, CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "../hooks/useAuth";
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

//  Rangos normales en células/µL completas 
const normalValues = {
  canino: {
    hematocrit: [37, 55],
    whiteBloodCells: [6000, 17000],
    totalProtein: [5.4, 7.8],
    platelets: [200000, 500000],
    segmentedNeutrophils: [60, 77],
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
    segmentedNeutrophils: [35, 75],
    bandNeutrophils: [0, 3],
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
  //  Obtener veterinario autenticado 
  const { data: authUser } = useAuth();

  if (!isOpen) return null;

  const cells = examData.differentialCount;
  const totalCells = examData.totalCells;
  const date = new Date(examData.date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  //  Formatear nombre completo del veterinario autenticado
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

  const handlePrintPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "", "height=800,width=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hematología - ${patientData.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 40px;
              color: #1A3E4A;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0A7EA4;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 { 
              color: #0A7EA4;
              font-size: 26px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .subtitle {
              color: #5A7C88;
              font-size: 14px;
            }
            .info-section {
              margin-bottom: 25px;
              padding: 20px;
              background: #E0F4F8;
              border-radius: 10px;
              border-left: 4px solid #0A7EA4;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .info-row {
              font-size: 13px;
              line-height: 1.6;
            }
            .info-label {
              font-weight: 600;
              color: #085F7A;
              display: inline-block;
              min-width: 120px;
            }
            h2 {
              background: linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%);
              color: white;
              padding: 12px 20px;
              margin: 25px 0 15px 0;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 700;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            th {
              background: linear-gradient(135deg, #0A7EA4 0%, #085F7A 100%);
              color: white;
              padding: 10px 8px;
              text-align: center;
              font-weight: 600;
              border: 1px solid #0A7EA4;
              font-size: 11px;
              text-transform: uppercase;
            }
            td {
              padding: 10px 8px;
              border: 1px solid #E0F4F8;
              text-align: center;
              font-size: 12px;
            }
            tr:nth-child(even) {
              background-color: #F8FCFD;
            }
            tr:hover {
              background-color: #E0F4F8;
            }
            .param-name {
              text-align: left;
              font-weight: 600;
              background: #E0F4F8;
              color: #085F7A;
              padding-left: 15px;
            }
            .value-cell {
              font-weight: 700;
              color: #0A7EA4;
              font-size: 13px;
            }
            .notes-section {
              margin: 25px 0;
              padding: 20px;
              background: #E0F4F8;
              border-left: 4px solid #36BCD4;
              border-radius: 0 8px 8px 0;
            }
            .notes-title {
              font-weight: 700;
              color: #085F7A;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .notes-content {
              color: #1A3E4A;
              line-height: 1.6;
              font-size: 12px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 25px;
              border-top: 2px solid #E0F4F8;
              text-align: center;
              color: #5A7C88;
              font-size: 11px;
            }
            .footer p {
              margin: 4px 0;
            }
            .footer-vet {
              font-weight: 700;
              color: #0A7EA4;
              font-size: 13px;
              margin-bottom: 5px;
            }
            @media print {
              body { padding: 15px; }
              @page { margin: 1.5cm; }
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

  const neutrofilosSegPer = calculatePercentage(
    cells.segmentedNeutrophils || 0
  );
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

        {/* PDF Preview Content  */}
        <div ref={printRef} className="hidden">
          <div className="header">
            <h1>RESULTADOS DE HEMATOLOGÍA</h1>
            <p className="subtitle">Análisis Hematológico Completo</p>
          </div>

          <div className="info-section">
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Fecha:</span> {date}
              </div>
              <div className="info-row">
                <span className="info-label">Paciente:</span> {patientData.name}
              </div>
              <div className="info-row">
                <span className="info-label">Especie:</span>{" "}
                {patientData.species}
              </div>
              <div className="info-row">
                <span className="info-label">Raza:</span>{" "}
                {examData.breed || "No especificado"}
              </div>
              <div className="info-row">
                <span className="info-label">Propietario:</span>{" "}
                {patientData.owner.name || "No especificado"}
              </div>
              <div className="info-row">
                <span className="info-label">Médico Tratante:</span>{" "}
                {examData.treatingVet || "No especificado"}
              </div>
            </div>
          </div>

          <h2>Valores del Hemograma</h2>
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>PARÁMETRO</th>
                <th rowSpan={2}>RESULTADO</th>
                <th rowSpan={2}>UNIDAD</th>
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
                <td className="value-cell">{examData.hematocrit}</td>
                <td>%</td>
                <td>
                  {normalValues.canino.hematocrit[0]} -{" "}
                  {normalValues.canino.hematocrit[1]}
                </td>
                <td>
                  {normalValues.felino.hematocrit[0]} -{" "}
                  {normalValues.felino.hematocrit[1]}
                </td>
              </tr>
              <tr>
                <td className="param-name">Glóbulos Blancos</td>
                <td className="value-cell">{wbcDisplay}</td>
                <td>células/µL</td>
                <td>
                  {formatNumber(normalValues.canino.whiteBloodCells[0])} -{" "}
                  {formatNumber(normalValues.canino.whiteBloodCells[1])}
                </td>
                <td>
                  {formatNumber(normalValues.felino.whiteBloodCells[0])} -{" "}
                  {formatNumber(normalValues.felino.whiteBloodCells[1])}
                </td>
              </tr>
              <tr>
                <td className="param-name">Plaquetas</td>
                <td className="value-cell">{plateletsDisplay}</td>
                <td>células/µL</td>
                <td>
                  {formatNumber(normalValues.canino.platelets[0])} -{" "}
                  {formatNumber(normalValues.canino.platelets[1])}
                </td>
                <td>
                  {formatNumber(normalValues.felino.platelets[0])} -{" "}
                  {formatNumber(normalValues.felino.platelets[1])}
                </td>
              </tr>
              <tr>
                <td className="param-name">Proteínas Totales</td>
                <td className="value-cell">{examData.totalProtein}</td>
                <td>g/dL</td>
                <td>
                  {normalValues.canino.totalProtein[0]} -{" "}
                  {normalValues.canino.totalProtein[1]}
                </td>
                <td>
                  {normalValues.felino.totalProtein[0]} -{" "}
                  {normalValues.felino.totalProtein[1]}
                </td>
              </tr>
            </tbody>
          </table>

          <h2>Fórmula Leucocitaria</h2>
          <table>
            <thead>
              <tr>
                <th>TIPO CELULAR</th>
                <th>%</th>
                <th>ABSOLUTO (células/µL)</th>
                <th>CANINO (%)</th>
                <th>FELINO (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="param-name">Neutrófilos Segmentados</td>
                <td className="value-cell">{neutrofilosSegPer}%</td>
                <td>{calculateAbsolute(Number(neutrofilosSegPer))}</td>
                <td>
                  {normalValues.canino.segmentedNeutrophils[0]} -{" "}
                  {normalValues.canino.segmentedNeutrophils[1]}
                </td>
                <td>
                  {normalValues.felino.segmentedNeutrophils[0]} -{" "}
                  {normalValues.felino.segmentedNeutrophils[1]}
                </td>
              </tr>
              <tr>
                <td className="param-name">Neutrófilos en Banda</td>
                <td className="value-cell">{neutrofilosBandPer}%</td>
                <td>{calculateAbsolute(Number(neutrofilosBandPer))}</td>
                <td>
                  {normalValues.canino.bandNeutrophils[0]} -{" "}
                  {normalValues.canino.bandNeutrophils[1]}
                </td>
                <td>
                  {normalValues.felino.bandNeutrophils[0]} -{" "}
                  {normalValues.felino.bandNeutrophils[1]}
                </td>
              </tr>
              <tr>
                <td className="param-name">Linfocitos</td>
                <td className="value-cell">{linfocitosPer}%</td>
                <td>{calculateAbsolute(Number(linfocitosPer))}</td>
                <td>
                  {normalValues.canino.lymphocytes[0]} -{" "}
                  {normalValues.canino.lymphocytes[1]}
                </td>
                <td>
                  {normalValues.felino.lymphocytes[0]} -{" "}
                  {normalValues.felino.lymphocytes[1]}
                </td>
              </tr>
              <tr>
                <td className="param-name">Monocitos</td>
                <td className="value-cell">{monocitosPer}%</td>
                <td>{calculateAbsolute(Number(monocitosPer))}</td>
                <td>
                  {normalValues.canino.monocytes[0]} -{" "}
                  {normalValues.canino.monocytes[1]}
                </td>
                <td>
                  {normalValues.felino.monocytes[0]} -{" "}
                  {normalValues.felino.monocytes[1]}
                </td>
              </tr>
              <tr>
                <td className="param-name">Eosinófilos</td>
                <td className="value-cell">{eosinofilosPer}%</td>
                <td>{calculateAbsolute(Number(eosinofilosPer))}</td>
                <td>
                  {normalValues.canino.eosinophils[0]} -{" "}
                  {normalValues.canino.eosinophils[1]}
                </td>
                <td>
                  {normalValues.felino.eosinophils[0]} -{" "}
                  {normalValues.felino.eosinophils[1]}
                </td>
              </tr>
              <tr>
                <td className="param-name">Basófilos</td>
                <td className="value-cell">{basofilosPer}%</td>
                <td>{calculateAbsolute(Number(basofilosPer))}</td>
                <td>Raros</td>
                <td>Raros</td>
              </tr>
            </tbody>
          </table>

          {(examData.hemotropico || examData.observacion) && (
            <div className="notes-section">
              {examData.hemotropico && (
                <div className="margin-bottom: 15px;">
                  <div className="notes-title">Hallazgos Hemotrópicos:</div>
                  <div className="notes-content">{examData.hemotropico}</div>
                </div>
              )}
              {examData.observacion && (
                <div>
                  <div className="notes-title">Observaciones Clínicas:</div>
                  <div className="notes-content">{examData.observacion}</div>
                </div>
              )}
            </div>
          )}

          {/* ✅ Footer con veterinario autenticado (dueño de la clínica) */}

          <div className="footer">
            <p className="footer-vet">{getVetFullName()}</p>
            <p>
              C.I: 15.261.220 | CMV: 1833 | INSAI: 733116117279 | MSDS: 7642
            </p>
            <br />
            <p className="font-style: italic;">
              Para cualquier consulta sobre estos resultados, no dude en
              contactarnos.
            </p>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="p-6 space-y-4">
          {/* Info del examen */}
          <div className="bg-gradient-to-br from-vet-light/50 to-white border border-vet-primary/20 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-vet-muted font-medium">Paciente</p>
                <p className="text-sm font-bold text-vet-text">
                  {patientData.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-vet-muted font-medium">Especie</p>
                <p className="text-sm font-bold text-vet-text capitalize">
                  {patientData.species}
                </p>
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
              <p className="text-[10px] text-vet-muted font-medium uppercase">
                Hematocrito
              </p>
              <p className="text-xl font-bold text-vet-primary">
                {examData.hematocrit}%
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">
                Leucocitos
              </p>
              <p className="text-xl font-bold text-vet-primary">{wbcDisplay}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">
                Plaquetas
              </p>
              <p className="text-xl font-bold text-vet-primary">
                {plateletsDisplay}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-vet-muted font-medium uppercase">
                Proteínas
              </p>
              <p className="text-xl font-bold text-vet-primary">
                {examData.totalProtein}
              </p>
            </div>
          </div>

          {/* Notas si existen */}
          {(examData.hemotropico || examData.observacion) && (
            <div className="space-y-3">
              {examData.hemotropico && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-bold text-blue-800 mb-1">
                    Hallazgos Hemotrópicos
                  </p>
                  <p className="text-sm text-blue-900">
                    {examData.hemotropico}
                  </p>
                </div>
              )}
              {examData.observacion && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-800 mb-1">
                    Observaciones Clínicas
                  </p>
                  <p className="text-sm text-amber-900">
                    {examData.observacion}
                  </p>
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
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl px-6 py-3 transition-all duration-300 shadow-lg shadow-vet-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-5 h-5" />
            <span>Generar PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
