/**
 * formulario-materiales.js — v20
 * Incluye canvas de firmas idéntico al de intervenciones
 */

let fotosArray = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['empleado', 'jefe']);

  const profile = await window.getCurrentProfile?.();
  if (!profile) return;

  initPhotos();

  // ── Inicializar canvas de firmas (igual que en intervenciones) ──
  initSignaturePad('canvas-firma-despachado', 'inp-firma-despachado', 'btn-clear-despachado');
  initSignaturePad('canvas-firma-recibido',   'inp-firma-recibido',   'btn-clear-recibido');

  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get('id');

  if (formId) {
    await cargarFormularioExistente(formId);
  } else {
    await generarSiguienteNumero(profile.id);
    // Auto-fill fecha actual
    autoFillFecha();
    // Inicializar con 3 filas dinámicas vacías
    const tbody = document.getElementById('items-tbody');
    if (tbody) tbody.innerHTML = '';
    agregarFila();
    agregarFila();
    agregarFila();
  }

  const btnAdd = document.getElementById('btn-add-item');
  if (btnAdd) btnAdd.addEventListener('click', agregarFila);

  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) btnGuardar.addEventListener('click', () => guardarFormulario(profile.id, formId));

  const btnImprimir = document.getElementById('btn-imprimir');
  if (btnImprimir) btnImprimir.addEventListener('click', () => window.printForm?.() || window.print());

  const btnPdf = document.getElementById('btn-pdf');
  if (btnPdf) btnPdf.addEventListener('click', () => window.generatePDFMateriales?.());

  const btnEmail = document.getElementById('btn-email');
  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      const modal = document.getElementById('email-modal');
      if (modal) modal.classList.add('active');
    });
  }

  const btnEnviarEmail = document.getElementById('btn-enviar-email');
  if (btnEnviarEmail) {
    btnEnviarEmail.addEventListener('click', () => {
      const destino = document.getElementById('email-destino').value;
      const formData = recolectarDatos();
      window.sendMaterialesEmail?.(destino, formData);
      const modal = document.getElementById('email-modal');
      if (modal) modal.classList.remove('active');
    });
  }

  const btnCancelEmail = document.getElementById('btn-cancel-email');
  if (btnCancelEmail) {
    btnCancelEmail.addEventListener('click', () => {
      const modal = document.getElementById('email-modal');
      if (modal) modal.classList.remove('active');
    });
  }

  // Close modal on backdrop click
  const emailModal = document.getElementById('email-modal');
  if (emailModal) {
    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) emailModal.classList.remove('active');
    });
  }
});

/* ── Auto-fill fecha ── */
function autoFillFecha() {
  const hoy = new Date();
  const diaEl  = document.getElementById('inp-fecha-dia');
  const mesEl  = document.getElementById('inp-fecha-mes');
  const anioEl = document.getElementById('inp-fecha-anio');
  if (diaEl)  diaEl.value  = String(hoy.getDate()).padStart(2, '0');
  if (mesEl)  mesEl.value  = String(hoy.getMonth() + 1).padStart(2, '0');
  if (anioEl) anioEl.value = String(hoy.getFullYear());
}

/* ── Tabla de items ── */
function agregarFila(item = null) {
  const tbody = document.getElementById('items-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="number" class="inp-cantidad" value="${item ? item.cantidad : 1}" min="1" style="width:100%"></td>
    <td><input type="text" class="inp-descripcion" value="${item ? escHtml(item.descripcion) : ''}" style="width:100%"></td>
    <td><input type="number" class="inp-precio" value="${item ? item.precio : 0}" step="0.01" style="width:100%"></td>
    <td class="td-total">${item ? (item.cantidad * item.precio).toFixed(2) : '0.00'}</td>
    <td><button type="button" class="btn-remove-row" title="Eliminar fila" style="background:var(--danger);color:white;border:none;border-radius:4px;padding:2px 7px;cursor:pointer;font-size:0.8rem;">✕</button></td>
  `;

  tbody.appendChild(tr);

  tr.querySelector('.btn-remove-row').addEventListener('click', () => {
    tr.remove();
    recalcularTotal();
  });

  const recalcularFila = () => {
    const cant   = parseFloat(tr.querySelector('.inp-cantidad').value) || 0;
    const precio = parseFloat(tr.querySelector('.inp-precio').value)   || 0;
    tr.querySelector('.td-total').textContent = (cant * precio).toFixed(2);
    recalcularTotal();
  };

  tr.querySelector('.inp-cantidad').addEventListener('input', recalcularFila);
  tr.querySelector('.inp-precio').addEventListener('input', recalcularFila);
  recalcularTotal();
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function recalcularTotal() {
  const totales = Array.from(document.querySelectorAll('.td-total'))
    .map(td => parseFloat(td.textContent) || 0);
  const total = totales.reduce((a, b) => a + b, 0);
  const display = document.getElementById('total-display');
  if (display) display.textContent = total.toFixed(2);
}

/* ── Generar número ── */
async function generarSiguienteNumero(usuarioId) {
  try {
    const { data, error } = await window.supabaseClient
      .from('formularios_materiales')
      .select('numero')
      .eq('usuario_id', usuarioId)
      .order('numero', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0) nextNum = data[0].numero + 1;

    const numeroEl = document.getElementById('form-numero');
    if (numeroEl) {
      numeroEl.textContent = nextNum;
      numeroEl.dataset.value = nextNum;
    }
  } catch (err) {
    console.error('Error calculando número:', err);
  }
}

/* ── Cargar formulario existente ── */
async function cargarFormularioExistente(id) {
  try {
    const { data, error } = await window.supabaseClient
      .from('formularios_materiales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return;

    const numeroEl = document.getElementById('form-numero');
    if (numeroEl) {
      numeroEl.textContent   = data.numero;
      numeroEl.dataset.value = data.numero;
    }

    document.getElementById('inp-fecha-dia').value   = data.fecha_dia   || '';
    document.getElementById('inp-fecha-mes').value   = data.fecha_mes   || '';
    document.getElementById('inp-fecha-anio').value  = data.fecha_anio  || '';
    document.getElementById('inp-cliente').value     = data.cliente     || '';
    document.getElementById('inp-direccion').value   = data.direccion   || '';
    document.getElementById('inp-telefono').value    = data.telefono    || '';
    const inpDesp = document.getElementById('inp-despachado');
    if (inpDesp) inpDesp.value = data.despachado_por || '';
    const inpRecibido = document.getElementById('inp-recibido');
    if (inpRecibido) inpRecibido.value = data.recibido_conforme || '';
    document.getElementById('ta-observaciones').value = data.observaciones || '';

    // ── Cargar firmas en canvas ──
    document.getElementById('canvas-firma-despachado')?.loadSignature?.(data.firma_despachado);
    document.getElementById('canvas-firma-recibido')?.loadSignature?.(data.firma_recibido);

    fotosArray = data.fotos || [];
    renderPhotos();

    const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
    const tbody = document.getElementById('items-tbody');
    if (tbody) tbody.innerHTML = '';
    if (items && Array.isArray(items)) items.forEach(item => agregarFila(item));

    const totalEl = document.getElementById('total-display');
    if (totalEl) totalEl.textContent = parseFloat(data.total || 0).toFixed(2);

  } catch (err) {
    console.error('Error cargando formulario:', err);
  }
}

/* ── Recolectar datos ── */
function recolectarDatos() {
  const items = [];
  document.querySelectorAll('#items-tbody tr').forEach(tr => {
    items.push({
      cantidad:     parseFloat(tr.querySelector('.inp-cantidad')?.value)    || 0,
      descripcion:  tr.querySelector('.inp-descripcion')?.value             || '',
      precio:       parseFloat(tr.querySelector('.inp-precio')?.value)      || 0
    });
  });

  return {
    fecha_dia:          parseInt(document.getElementById('inp-fecha-dia')?.value)  || null,
    fecha_mes:          parseInt(document.getElementById('inp-fecha-mes')?.value)  || null,
    fecha_anio:         parseInt(document.getElementById('inp-fecha-anio')?.value) || null,
    cliente:            document.getElementById('inp-cliente')?.value              || '',
    direccion:          document.getElementById('inp-direccion')?.value            || '',
    telefono:           document.getElementById('inp-telefono')?.value             || '',
    items:              JSON.stringify(items),
    total:              parseFloat(document.getElementById('total-display')?.textContent) || 0,
    despachado_por:     document.getElementById('inp-despachado')?.value           || '',
    recibido_conforme:  document.getElementById('inp-recibido')?.value             || '',
    observaciones:      document.getElementById('ta-observaciones')?.value         || '',
    firma_despachado:   document.getElementById('inp-firma-despachado')?.value     || '',
    firma_recibido:     document.getElementById('inp-firma-recibido')?.value       || '',
    fotos:              fotosArray
  };
}

/* ── Guardar formulario ── */
async function guardarFormulario(usuarioId, formId) {
  const datos = recolectarDatos();
  datos.usuario_id = usuarioId;

  const statusEl = document.getElementById('save-status');
  function showStatus(msg, type = '') {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'visible ' + type;
    setTimeout(() => { statusEl.className = ''; }, 3500);
  }

  showStatus('Guardando...');

  try {
    if (formId) {
      const { error } = await window.supabaseClient
        .from('formularios_materiales')
        .update(datos)
        .eq('id', formId);
      if (error) throw error;
      showStatus('✅ Actualizado exitosamente.', 'success');
    } else {
      datos.numero = parseInt(document.getElementById('form-numero')?.dataset?.value || '1', 10);
      const { error } = await window.supabaseClient
        .from('formularios_materiales')
        .insert(datos);
      if (error) throw error;
      showStatus('✅ Guardado exitosamente.', 'success');
    }
  } catch (err) {
    console.error('Error guardando:', err);
    showStatus('❌ Error: ' + err.message, 'error');
  }
}

/* ════════════════════════════════════════
   CANVAS SIGNATURE PAD — igual a Intervención
   ════════════════════════════════════════ */
function initSignaturePad(canvasId, inputId, clearBtnId) {
  const canvas   = document.getElementById(canvasId);
  const input    = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);
  if (!canvas || !input) return;

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#071929';
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  let drawing = false;
  let lastPos = { x: 0, y: 0 };

  function getPos(e) {
    const rect    = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width)  * canvas.width,
      y: ((clientY - rect.top)  / rect.height) * canvas.height
    };
  }

  function startDrawing(e) {
    if (e.cancelable) e.preventDefault();
    drawing = true;
    lastPos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(lastPos.x, lastPos.y);
    ctx.stroke();
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const newPos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.stroke();
    lastPos = newPos;
    input.value = canvas.toDataURL();
  }

  function stopDrawing() { drawing = false; }

  canvas.addEventListener('mousedown',  startDrawing);
  canvas.addEventListener('mousemove',  draw);
  canvas.addEventListener('mouseup',    stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove',  draw,         { passive: false });
  canvas.addEventListener('touchend',   stopDrawing);

  clearBtn?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    input.value = '';
  });

  canvas.loadSignature = (base64Data) => {
    if (!base64Data || !base64Data.startsWith('data:image')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      input.value = '';
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      input.value = base64Data;
    };
    img.src = base64Data;
  };
}

/* ════════════════════════════════════════
   PHOTOS
   ════════════════════════════════════════ */
function initPhotos() {
  const btnCamera  = document.getElementById('btn-camera');
  const btnUpload  = document.getElementById('btn-upload');
  const inpCamera  = document.getElementById('inp-camera');
  const inpUpload  = document.getElementById('inp-upload');
  const lightbox   = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');

  if (btnCamera && inpCamera) {
    btnCamera.addEventListener('click', () => inpCamera.click());
    inpCamera.addEventListener('change', handlePhotoSelection);
  }
  if (btnUpload && inpUpload) {
    btnUpload.addEventListener('click', () => inpUpload.click());
    inpUpload.addEventListener('change', handlePhotoSelection);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox?.classList.remove('active'));
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });

  function handlePhotoSelection(e) {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const max = 800;
          if (w > h) { if (w > max) { h *= max / w; w = max; } }
          else        { if (h > max) { w *= max / h; h = max; } }
          canvas.width  = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          fotosArray.push(canvas.toDataURL('image/jpeg', 0.6));
          renderPhotos();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
    if (inpCamera) inpCamera.value = '';
    if (inpUpload) inpUpload.value = '';
  }
}

function renderPhotos() {
  const previewContainer = document.getElementById('photos-preview');
  if (!previewContainer) return;
  previewContainer.innerHTML = '';

  fotosArray.forEach((base64, index) => {
    const container = document.createElement('div');
    container.className = 'photo-thumbnail-container';

    const img = document.createElement('img');
    img.src = base64;
    img.addEventListener('click', () => {
      const lightbox    = document.getElementById('lightbox-modal');
      const lightboxImg = document.getElementById('lightbox-img');
      if (lightbox && lightboxImg) {
        lightboxImg.src = base64;
        lightbox.classList.add('active');
      }
    });

    const btnDelete = document.createElement('button');
    btnDelete.type      = 'button';
    btnDelete.className = 'btn-delete-photo';
    btnDelete.innerHTML = '&times;';
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      fotosArray.splice(index, 1);
      renderPhotos();
    });

    container.appendChild(img);
    container.appendChild(btnDelete);
    previewContainer.appendChild(container);
  });
}

window.recolectarDatosMateriales = recolectarDatos;
