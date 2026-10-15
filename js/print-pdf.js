/**
 * print-pdf.js — Generación profesional de PDF con todos los campos del formulario
 * Dependencia: jsPDF (window.jspdf)
 */

/* ===== UTILIDADES COMUNES ===== */
function initPDFDoc() {
  if (!window.jspdf) { alert('jsPDF no está cargado.'); return null; }
  const { jsPDF } = window.jspdf;
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

function pdfHeader(doc, numero) {
  const W = 210; // A4 width mm
  // Background azul oscuro para la cabecera
  doc.setFillColor(12, 35, 64);
  doc.rect(0, 0, W, 28, 'F');

  // Logo y nombre empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ProFrio Industrial E.I.R.L.', 10, 10);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Santo Domingo, D.N.  |  profrio.industrial@gmail.com  |  RNC 1-3175431-7  |  Tel: 829-727-0103', 10, 17);

  // Número de formulario (derecha)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`No.  ${numero}`, W - 10, 10, { align: 'right' });
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(18);
  doc.text(String(numero).padStart(5, '0'), W - 10, 22, { align: 'right' });

  return 32; // y inicial tras el header
}

function pdfSectionTitle(doc, y, text, W) {
  doc.setFillColor(12, 35, 64);
  doc.rect(8, y, W - 16, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 11, y + 4.2);
  doc.setTextColor(0, 0, 0);
  return y + 8;
}

function pdfField(doc, y, label, value, x, maxWidth) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x, y);
  const labelW = doc.getTextWidth(label) + 1;
  doc.setFont('helvetica', 'normal');
  const val = value || '';
  doc.text(val, x + labelW, y);
  // underline
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(x + labelW, y + 0.5, x + maxWidth, y + 0.5);
  return y;
}

function pdfCheckbox(doc, x, y, label, checked) {
  doc.setFillColor(checked ? 12 : 255, checked ? 35 : 255, checked ? 64 : 255);
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);
  doc.rect(x, y - 2.5, 3, 3, checked ? 'FD' : 'D');
  if (checked) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text('X', x + 0.6, y - 0.4);
  }
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + 4, y - 0.3);
}

/* ===== PDF INTERVENCIÓN ===== */
async function generatePDFIntervencion() {
  const doc = initPDFDoc();
  if (!doc) return;

  const W = 210;
  const num = document.getElementById('form-numero')?.textContent?.trim() || 'N/A';
  const getVal = id => (document.getElementById(id)?.value || '').trim();
  const getChk = id => document.getElementById(id)?.checked || false;

  let y = pdfHeader(doc, num);

  // Título
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 35, 64);
  doc.text('HOJA DE INTERVENCIÓN', W / 2, y, { align: 'center' });
  y += 7;

  // ---- DATOS GENERALES ----
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(8, y, W - 16, 22, 'D');
  y += 4;
  pdfField(doc, y, 'Nombre:', getVal('inp-nombre'), 10, 92);
  pdfField(doc, y, 'Jornada del:', getVal('inp-jornada'), 105, 95);
  y += 6;
  pdfField(doc, y, '# Desplazamiento:', getVal('inp-desplazamiento'), 10, 92);
  pdfField(doc, y, '# Intervinientes:', getVal('inp-intervinientes'), 105, 95);
  y += 6;

  // Tipo de servicio
  const tipos = [
    { id: 'radio-electricidad', label: 'ELECTRICIDAD-CLIMATIZACIÓN' },
    { id: 'radio-frio-comercial', label: 'FRIO COMERCIAL' },
    { id: 'radio-frio-industrial', label: 'FRIO INDUSTRIAL' }
  ];
  let tx = 10;
  tipos.forEach(t => {
    const checked = document.getElementById(t.id)?.checked || false;
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.circle(tx + 1.5, y - 1, 1.5, checked ? 'FD' : 'D');
    if (checked) { doc.setFillColor(12, 35, 64); doc.circle(tx + 1.5, y - 1, 0.8, 'F'); }
    doc.setFontSize(6.5);
    doc.setFont('helvetica', checked ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(t.label, tx + 4.5, y - 0.2);
    tx += doc.getTextWidth(t.label) + 10;
  });
  y += 8;

  // ---- CLIENTE ----
  doc.rect(8, y, W - 16, 14, 'D');
  y += 4;
  pdfField(doc, y, 'Cliente:', getVal('inp-cliente'), 10, 110);
  pdfField(doc, y, 'Tel:', getVal('inp-telefono'), 125, 75);
  y += 6;
  pdfField(doc, y, 'Dirección:', getVal('inp-direccion'), 10, 192);
  y += 10;

  // ---- ROLES Y HORAS ----
  doc.rect(8, y, W - 16, 14, 'D');
  y += 3;
  const roles = [
    { chk: 'chk-tecnico', lbl: 'Técnico', hrs: getVal('inp-horas-tecnico') },
    { chk: 'chk-jefe-obra', lbl: 'Jefe de obra', hrs: getVal('inp-horas-jefe-obra') },
    { chk: 'chk-jefe-equipo', lbl: 'Jefe de equipo', hrs: getVal('inp-horas-jefe-equipo') }
  ];
  let rx = 10;
  roles.forEach(r => {
    pdfCheckbox(doc, rx, y + 2, r.lbl, getChk(r.chk));
    doc.setFontSize(6.5);
    doc.text(`Hrs: ${r.hrs}`, rx + 25, y + 1.5);
    doc.setDrawColor(0); doc.setLineWidth(0.2);
    doc.line(rx + 25 + doc.getTextWidth('Hrs: '), y + 2.5, rx + 55, y + 2.5);
    rx += 65;
  });
  y += 14;

  // ---- EQUIPOS + TEMPERATURAS (2 columnas) ----
  const colW = (W - 16) / 2;
  const boxY = y;
  y = pdfSectionTitle(doc, y, 'EQUIPOS', W / 2 + 0);

  const equipos = [
    { id: 'chk-aires', lbl: 'Chequeo de aires acondicionados' },
    { id: 'chk-rack', lbl: 'Chequeo del rack' },
    { id: 'chk-nivel-liquido', lbl: `Nivel de líquido: ${getVal('inp-nivel-liquido')}` },
    { id: 'chk-nivel-aceite', lbl: `Nivel de aceite: ${getVal('inp-nivel-aceite')}` },
    { id: 'chk-correccion-fuga', lbl: 'Corrección de fuga' },
    { id: 'chk-carga-refrigerante', lbl: 'Carga de refrigerante' },
    { id: 'chk-cambio-compresor', lbl: 'Cambio compresor' },
    { id: 'chk-mant-aa', lbl: 'Mantenimiento A/A' },
    { id: 'chk-mant-nevera', lbl: 'Mantenimiento nevera' },
    { id: 'chk-cambio-solenoide', lbl: 'Cambio de solenoide' },
    { id: 'chk-cambio-abanico', lbl: 'Cambio de abanico' }
  ];
  const eqStartY = y;
  equipos.forEach((e, i) => {
    pdfCheckbox(doc, 11, y, e.lbl, getChk(e.id));
    y += 5;
  });
  const eqEndY = y;

  // Columna derecha: Temperaturas
  let ty = boxY;
  ty = pdfSectionTitle(doc, ty, 'TEMPERATURA NEVERA Y CUARTO FRÍO', W);
  // Re-position title for right column
  doc.setFillColor(12, 35, 64);
  doc.rect(8 + colW, boxY, colW, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TEMPERATURA NEVERA Y CUARTO FRÍO', 8 + colW + 2, boxY + 4.2);
  doc.setTextColor(0, 0, 0);
  ty = boxY + 8;

  // Subheaders NEVERA / CUARTO FRÍO
  doc.setFillColor(230, 240, 255);
  doc.rect(8 + colW, ty, colW / 2, 5, 'F');
  doc.rect(8 + colW + colW / 2, ty, colW / 2, 5, 'F');
  doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(12, 35, 64);
  doc.text('NEVERA', 8 + colW + colW / 4, ty + 3.5, { align: 'center' });
  doc.text('CUARTO FRÍO', 8 + colW + colW * 3 / 4, ty + 3.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  ty += 6;

  const tempRows = [
    ['Congelado', getVal('inp-temp-congelado'), 'Vegetales', getVal('inp-cf-vegetales')],
    ['Deli Queso', getVal('inp-temp-deli-queso'), 'Congelado', getVal('inp-cf-congelado')],
    ['Deli Carne', getVal('inp-temp-deli-carne'), 'Carnes', getVal('inp-cf-carnes')],
    ['Salami', getVal('inp-temp-salami'), 'Pescados', getVal('inp-cf-pescados')],
    ['Yogurt', getVal('inp-temp-yogurt'), 'Preparación', getVal('inp-cf-preparacion')],
    ['Vegetales', getVal('inp-temp-vegetales-nev'), '', ''],
    ['Jugos', getVal('inp-temp-jugos'), '', '']
  ];
  const cw4 = colW / 4;
  const cx = 8 + colW;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
  tempRows.forEach(row => {
    doc.text(row[0] + ':', cx + 1, ty);
    doc.text(row[1], cx + cw4 - 1, ty);
    doc.setDrawColor(180); doc.line(cx + cw4 - 1, ty + 0.5, cx + cw4 + cw4 - 3, ty + 0.5);
    doc.text(row[2] + ':', cx + cw4 * 2 + 1, ty);
    doc.text(row[3], cx + cw4 * 3 - 1, ty);
    doc.setDrawColor(180); doc.line(cx + cw4 * 3 - 1, ty + 0.5, cx + colW - 1, ty + 0.5);
    ty += 5;
  });

  y = Math.max(eqEndY, ty) + 2;

  // ---- OBSERVACIONES + PEDIDO DE MATERIALES ----
  doc.rect(8, y, colW, 20, 'D');
  doc.rect(8 + colW, y, colW, 20, 'D');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES:', 10, y + 4);
  doc.text('PEDIDO DE MATERIALES:', 10 + colW, y + 4);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
  const obs = doc.splitTextToSize(getVal('ta-observaciones'), colW - 4);
  const ped = doc.splitTextToSize(getVal('ta-pedido-materiales'), colW - 4);
  doc.text(obs, 10, y + 9);
  doc.text(ped, 10 + colW, y + 9);
  y += 22;

  // ---- FIRMAS ----
  const sigW = (W - 16) / 2 - 8;
  doc.setLineWidth(0.5); doc.setDrawColor(0);
  doc.line(12, y + 16, 12 + sigW, y + 16);
  doc.line(12 + colW, y + 16, 12 + colW + sigW, y + 16);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);

  const firmaInt = getVal('inp-firma-interviniente');
  const firmaCli = getVal('inp-firma-cliente');

  const [firmaIntClean, firmaCliClean] = await Promise.all([
    prepareSignatureForPDF(firmaInt),
    prepareSignatureForPDF(firmaCli)
  ]);

  if (firmaIntClean) {
    try {
      doc.addImage(firmaIntClean, 'JPEG', 12 + (sigW - 42) / 2, y + 1, 42, 14);
    } catch (e) {
      console.warn('Error drawing technician signature:', e);
    }
  }
  doc.text('FIRMA INTERVINIENTE', 12 + sigW / 2, y + 20, { align: 'center' });

  if (firmaCliClean) {
    try {
      doc.addImage(firmaCliClean, 'JPEG', 12 + colW + (sigW - 42) / 2, y + 1, 42, 14);
    } catch (e) {
      console.warn('Error drawing client signature:', e);
    }
  }
  doc.text('FIRMA CLIENTE (CON SELLO)', 12 + colW + sigW / 2, y + 20, { align: 'center' });
  y += 24;

  // Fotos en Intervención si existen
  await appendPhotosSectionToPDF(doc, num, W);

  const cliente = getVal('inp-cliente') || 'Cliente';
  doc.save(`Intervencion_No${num}_${cliente}.pdf`);
}

/* ===== PREPARACIÓN DE FIRMAS (FONDO BLANCO GARANTIZADO) ===== */
async function prepareSignatureForPDF(base64) {
  if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image')) {
    return null;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(img.naturalWidth || img.width || 300, 300);
        canvas.height = Math.max(img.naturalHeight || img.height || 130, 130);
        const ctx = canvas.getContext('2d');
        // Fondo blanco sólido puro: previene fondo negro en JPEG / jsPDF
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.warn('Error processing signature canvas:', err);
        resolve(base64);
      }
    };
    img.onerror = () => resolve(null);
    img.src = base64;
  });
}

/* ===== PREPARACIÓN DE FOTOS ===== */
async function preparePhotoForPDF(src) {
  if (!src || typeof src !== 'string') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || img.width || 800;
        let h = img.naturalHeight || img.height || 600;
        const max = 1200;
        if (w > max || h > max) {
          if (w > h) { h = Math.round(h * max / w); w = max; }
          else { w = Math.round(w * max / h); h = max; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
          width: w,
          height: h
        });
      } catch (err) {
        console.warn('Error processing photo for PDF:', err);
        resolve({ dataUrl: src, width: 800, height: 600 });
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ===== SECCIÓN DE FOTOS ADJUNTAS ===== */
async function appendPhotosSectionToPDF(doc, num, W) {
  let fotos = [];
  if (typeof window.getFotosFormulario === 'function') {
    fotos = window.getFotosFormulario() || [];
  }
  if (!fotos || fotos.length === 0) {
    if (Array.isArray(window.fotosArray) && window.fotosArray.length > 0) {
      fotos = window.fotosArray;
    } else {
      const previewImgs = document.querySelectorAll('#photos-preview img');
      if (previewImgs && previewImgs.length > 0) {
        fotos = Array.from(previewImgs).map(img => img.src);
      }
    }
  }

  if (fotos && fotos.length > 0) {
    doc.addPage();
    let py = pdfHeader(doc, num);
    py = pdfSectionTitle(doc, py, 'REGISTRO FOTOGRÁFICO / CAPTURAS EN OBSERVACIONES', W);
    py += 3;

    const photoColW = (W - 24) / 2; // ~93mm por columna
    const photoH = 65; // Altura en mm

    for (let i = 0; i < fotos.length; i++) {
      const col = i % 2;
      const posX = 10 + col * (photoColW + 4);

      if (col === 0 && i > 0) {
        py += photoH + 12;
        if (py + photoH > 275) {
          doc.addPage();
          py = pdfHeader(doc, num);
          py = pdfSectionTitle(doc, py, 'REGISTRO FOTOGRÁFICO (CONTINUACIÓN)', W);
          py += 3;
        }
      }

      const pData = await preparePhotoForPDF(fotos[i]);
      if (pData && pData.dataUrl) {
        // Marco de foto
        doc.setDrawColor(200, 215, 230);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(posX, py, photoColW, photoH + 7, 2, 2, 'FD');

        try {
          doc.addImage(pData.dataUrl, 'JPEG', posX + 1.5, py + 1.5, photoColW - 3, photoH);
        } catch (err) {
          console.warn('Error dibujando foto en PDF:', err);
        }

        // Título de la captura
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 138);
        doc.text(`Captura #${i + 1}`, posX + photoColW / 2, py + photoH + 5.5, { align: 'center' });
      }
    }
  }
}

/* ===== PDF MATERIALES Y SUMINISTROS ===== */
async function generatePDFMateriales() {
  const doc = initPDFDoc();
  if (!doc) return;

  const W = 210;
  const num = document.getElementById('form-numero')?.textContent?.trim() || 'N/A';
  const getVal = id => (document.getElementById(id)?.value || '').trim();

  let y = pdfHeader(doc, num);

  // Fecha
  const dia = getVal('inp-fecha-dia'), mes = getVal('inp-fecha-mes'), anio = getVal('inp-fecha-anio');
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
  doc.text(`FECHA: ${dia || 'DD'}/${mes || 'MM'}/${anio || 'AAAA'}`, W - 10, y, { align: 'right' });
  y += 5;

  // Título según tipo de solicitud seleccionado
  const isSuministro = document.getElementById('tipo-suministro')?.checked;
  const titulo = isSuministro ? 'HOJA DE SUMINISTRO DE ALMACÉN' : 'PEDIDO DE MATERIALES';

  doc.setFontSize(11.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(12, 35, 64);
  doc.text(titulo, W / 2, y, { align: 'center' });
  y += 7;

  // Cliente
  doc.setDrawColor(200); doc.setLineWidth(0.3);
  doc.rect(8, y, W - 16, 14, 'D');
  y += 4;
  pdfField(doc, y, 'Cliente:', getVal('inp-cliente'), 10, 120);
  pdfField(doc, y, 'Tel:', getVal('inp-telefono'), 130, 70);
  y += 6;
  pdfField(doc, y, 'Dirección:', getVal('inp-direccion'), 10, 192);
  y += 10;

  // Helper para pintar encabezado de la tabla
  const colWidths = [18, 96, 38, 38]; // CANT, DESC, P.UNIT, TOTAL
  const headers = ['CANT.', 'DESCRIPCIÓN', 'PRECIO UNITARIO', 'TOTAL'];
  const startX = 8;

  function drawTableHeader(atY) {
    doc.setFillColor(12, 35, 64);
    doc.rect(startX, atY, W - 16, 6, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    let cx2 = startX;
    headers.forEach((h, i) => {
      doc.text(h, cx2 + colWidths[i] / 2, atY + 4, { align: 'center' });
      cx2 += colWidths[i];
    });
    return atY + 6;
  }

  y = drawTableHeader(y);

  // Filas de items
  const rows = document.querySelectorAll('#items-tbody tr');
  let total = 0;
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);

  rows.forEach((row, idx) => {
    const cant = row.querySelector('.inp-cantidad')?.value || '';
    const desc = row.querySelector('.inp-descripcion')?.value || '';
    const precio = row.querySelector('.inp-precio')?.value || '';
    const rowTotal = row.querySelector('.td-total')?.textContent || '';
    if (!cant && !desc && !precio) return;
    total += parseFloat(rowTotal || 0);

    // Salto de página inteligente si la tabla desborda
    if (y > 265) {
      doc.addPage();
      y = pdfHeader(doc, num);
      y = drawTableHeader(y);
    }

    const bg = idx % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(startX, y, W - 16, 6, 'F');
    doc.setDrawColor(220); doc.setLineWidth(0.1);
    doc.rect(startX, y, W - 16, 6, 'D');
    let cx3 = startX;
    [cant, desc, precio, rowTotal].forEach((v, i) => {
      const align = (i === 2 || i === 3) ? 'right' : (i === 0 ? 'center' : 'left');
      const textX = align === 'right' ? cx3 + colWidths[i] - 1 : (align === 'center' ? cx3 + colWidths[i] / 2 : cx3 + 1);
      doc.text(String(v), textX, y + 4, { align });
      cx3 += colWidths[i];
    });
    y += 6;
  });

  // Total
  if (y > 255) {
    doc.addPage();
    y = pdfHeader(doc, num);
  }
  doc.setFillColor(12, 35, 64);
  doc.rect(startX, y, W - 16, 7, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.text('TOTAL:', startX + 140, y + 5);
  doc.text(`$ ${total.toFixed(2)}`, startX + W - 26, y + 5, { align: 'right' });
  y += 11;

  // ---- OBSERVACIONES (SECCIÓN COMPLETA AHORA INCLUIDA) ----
  const obsValue = getVal('ta-observaciones');
  if (y > 230) {
    doc.addPage();
    y = pdfHeader(doc, num);
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(200, 215, 230);
  doc.setLineWidth(0.3);
  doc.rect(8, y, W - 16, 20, 'FD');

  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(12, 35, 64);
  doc.text('OBSERVACIONES:', 11, y + 4.5);

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(30, 41, 59);
  const obsLines = doc.splitTextToSize(obsValue || 'Ninguna observación registrada.', W - 22);
  doc.text(obsLines, 11, y + 9);
  y += 24;

  // ---- FIRMAS (CON FONDO BLANCO GARANTIZADO) ----
  if (y > 235) {
    doc.addPage();
    y = pdfHeader(doc, num);
  }

  const sigW = (W - 16) / 2 - 8;
  doc.setLineWidth(0.5); doc.setDrawColor(0); doc.setTextColor(0, 0, 0);
  doc.line(12, y + 16, 12 + sigW, y + 16);
  doc.line(12 + sigW + 16, y + 16, 12 + sigW * 2 + 16, y + 16);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold');

  const firmaDesp = getVal('inp-firma-despachado');
  const firmaRec  = getVal('inp-firma-recibido');

  const [firmaDespClean, firmaRecClean] = await Promise.all([
    prepareSignatureForPDF(firmaDesp),
    prepareSignatureForPDF(firmaRec)
  ]);

  if (firmaDespClean) {
    try {
      doc.addImage(firmaDespClean, 'JPEG', 12 + (sigW - 42) / 2, y + 1, 42, 14);
    } catch (e) {
      console.warn('Error dibujando firma despachado:', e);
    }
  }
  if (firmaRecClean) {
    try {
      doc.addImage(firmaRecClean, 'JPEG', 12 + sigW + 16 + (sigW - 42) / 2, y + 1, 42, 14);
    } catch (e) {
      console.warn('Error dibujando firma recibido:', e);
    }
  }

  doc.text(getVal('inp-despachado') || 'DESPACHADO POR', 12 + sigW / 2, y + 20, { align: 'center' });
  doc.text(getVal('inp-recibido') || 'RECIBIDO CONFORME', 12 + sigW * 1.5 + 16, y + 20, { align: 'center' });
  y += 24;

  // ---- REGISTRO FOTOGRÁFICO EN EL PDF DE SUMINISTROS/MATERIALES ----
  await appendPhotosSectionToPDF(doc, num, W);

  const cliente = getVal('inp-cliente') || 'Cliente';
  doc.save(`${titulo.replace(/\s+/g, '_')}_No${num}_${cliente}.pdf`);
}

function prepareTextareasForPrint() {
  document.querySelectorAll('textarea').forEach(ta => {
    ta.style.height = 'auto';
    ta.style.height = Math.max(ta.scrollHeight + 6, 32) + 'px';
  });
}

function restoreTextareasAfterPrint() {
  document.querySelectorAll('textarea').forEach(ta => {
    ta.style.height = '';
  });
}

window.addEventListener('beforeprint', prepareTextareasForPrint);
window.addEventListener('afterprint', restoreTextareasAfterPrint);

function printForm() {
  prepareTextareasForPrint();
  setTimeout(() => {
    window.print();
  }, 100);
}

window.generatePDFIntervencion = generatePDFIntervencion;
window.generatePDFMateriales = generatePDFMateriales;
window.printForm = printForm;
