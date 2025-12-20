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
        margin: [8, 5, 8, 5], // [top, left, bottom, right] - más simétrico
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 794, // Ancho A4 en px a 96dpi
          windowWidth: 794,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
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