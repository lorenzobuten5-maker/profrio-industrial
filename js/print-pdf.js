/**
 * print-pdf.js
 * Dependencia: jsPDF (window.jspdf)
 */

function generatePDFIntervencion() {
  if (!window.jspdf) {
    alert("jsPDF no está cargado.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const formData = window.recolectarDatosIntervencion ? window.recolectarDatosIntervencion() : {};
  const num = document.getElementById('form-numero')?.textContent || 'N/A';
  
  doc.setFontSize(20);
  doc.text("ProFrio Industrial E.I.R.L.", 10, 20);
  doc.setFontSize(14);
  doc.text(`Formulario de Intervención #${num}`, 10, 30);
  
  doc.setFontSize(10);
  let y = 40;
  
  const addToDoc = (label, value) => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(`${label}: ${value || ''}`, 10, y);
    y += 10;
  };
  
  addToDoc('Cliente', formData.cliente);
  addToDoc('Dirección', formData.direccion);
  addToDoc('Teléfono', formData.telefono);
  addToDoc('Tipo de Servicio', formData.tipo_servicio);
  
  // Agregar más campos como sea necesario
  addToDoc('Observaciones', formData.observaciones);
  
  doc.save(`Intervencion_N${num}_${formData.cliente || 'Cliente'}.pdf`);
}

function generatePDFMateriales() {
  if (!window.jspdf) {
    alert("jsPDF no está cargado.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const formData = window.recolectarDatosMateriales ? window.recolectarDatosMateriales() : {};
  const num = document.getElementById('form-numero')?.textContent || 'N/A';
  
  doc.setFontSize(20);
  doc.text("ProFrio Industrial E.I.R.L.", 10, 20);
  doc.setFontSize(14);
  doc.text(`Solicitud de Materiales #${num}`, 10, 30);
  
  doc.setFontSize(10);
  doc.text(`Cliente: ${formData.cliente}`, 10, 40);
  doc.text(`Fecha: ${formData.fecha_dia}/${formData.fecha_mes}/${formData.fecha_anio}`, 10, 50);
  doc.text(`Total: $${formData.total}`, 10, 60);
  
  doc.save(`Materiales_N${num}_${formData.cliente || 'Cliente'}.pdf`);
}

function printForm() {
  window.print();
}

window.generatePDFIntervencion = generatePDFIntervencion;
window.generatePDFMateriales = generatePDFMateriales;
window.printForm = printForm;
