/**
 * formulario-materiales.js — v20
 * Incluye canvas de firmas idéntico al de intervenciones
 */

let fotosArray = [];
const DRAFT_KEY = 'pf_draft_materiales';

function guardarBorradorLocal() {
  try {
    const datos = recolectarDatos();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(datos));
  } catch (_) {}
}

function restaurarBorradorLocal() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data) return;

    if (data.fecha_dia) document.getElementById('inp-fecha-dia').value = data.fecha_dia;
    if (data.fecha_mes) document.getElementById('inp-fecha-mes').value = data.fecha_mes;
    if (data.fecha_anio) document.getElementById('inp-fecha-anio').value = data.fecha_anio;
    if (data.cliente) document.getElementById('inp-cliente').value = data.cliente;
    if (data.direccion) document.getElementById('inp-direccion').value = data.direccion;
    if (data.telefono) document.getElementById('inp-telefono').value = data.telefono;
    if (data.despachado_por) document.getElementById('inp-despachado').value = data.despachado_por;
    if (data.tipo_solicitud) {
      const rad = document.querySelector(`input[name="tipo_solicitud"][value="${data.tipo_solicitud}"]`);
      if (rad) {
        rad.checked = true;
        rad.dispatchEvent(new Event('change'));
      }
    }
    if (data.recibido_conforme) document.getElementById('inp-recibido').value = data.recibido_conforme;
    if (data.observaciones) document.getElementById('ta-observaciones').value = data.observaciones;

    if (data.items) {
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
      const tbody = document.getElementById('items-tbody');
      if (tbody && Array.isArray(items) && items.length > 0) {
        tbody.innerHTML = '';
        items.forEach(item => agregarFila(item));
      }
    }

    if (data.fotos && Array.isArray(data.fotos)) {
      fotosArray = data.fotos;
      renderPhotos();
    }

    if (data.firma_despachado) document.getElementById('canvas-firma-despachado')?.loadSignature?.(data.firma_despachado);
    if (data.firma_recibido) document.getElementById('canvas-firma-recibido')?.loadSignature?.(data.firma_recibido);

    if (window.showToast) {
      window.showToast('📋 Se cargó tu borrador anterior. Usa "Nuevo en Blanco" para limpiar.', 'warning', 4500);
    }
  } catch (_) {}
}

function limpiarBorradorLocal() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
}

function limpiarFormularioCompleto(usuarioId) {
  limpiarBorradorLocal();

  ['inp-cliente', 'inp-direccion', 'inp-telefono', 'inp-despachado', 'inp-recibido', 'ta-observaciones', 'inp-firma-despachado', 'inp-firma-recibido'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('btn-clear-despachado')?.click();
  document.getElementById('btn-clear-recibido')?.click();

  fotosArray = [];
  renderPhotos();

  const tbody = document.getElementById('items-tbody');
  if (tbody) tbody.innerHTML = '';
  agregarFila();
  agregarFila();
  agregarFila();

  recalcularTotal();
  autoFillFecha();
  if (usuarioId) generarSiguienteNumero(usuarioId);

  if (window.showToast) window.showToast('✨ Formulario en blanco listo', 'info');
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['empleado', 'jefe']);

  const profile = await window.getCurrentProfile?.();
  if (!profile) return;

  // Initialize signature pads
  initSignaturePad('canvas-firma-despachado', 'inp-firma-despachado', 'btn-clear-despachado');
  initSignaturePad('canvas-firma-recibido',   'inp-firma-recibido',   'btn-clear-recibido');

  // Tipo selector title updater
  function actualizarTituloPorTipo() {
    const tipoVal = document.querySelector('input[name="tipo_solicitud"]:checked')?.value;
    const titleEl = document.getElementById('form-title-materiales');
    if (titleEl) {
      if (tipoVal === 'suministro') {
        titleEl.textContent = 'SOLICITUD DE SUMINISTROS DE ALMACÉN';
      } else {
        titleEl.textContent = 'PEDIDO DE MATERIALES';
      }
    }
  }

  document.querySelectorAll('input[name="tipo_solicitud"]').forEach(radio => {
    radio.addEventListener('change', actualizarTituloPorTipo);
  });
  actualizarTituloPorTipo();

  // Global Haptic Feedback listener for buttons and inputs
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .btn, .btn-remove-row, input[type="checkbox"], input[type="radio"]');
    if (target && window.hapticFeedback) {
      window.hapticFeedback([30]);
    }
  });

  // ── Inicializar canvas de firmas ──
  initSignaturePad('canvas-firma-despachado', 'inp-firma-despachado', 'btn-clear-despachado');
  initSignaturePad('canvas-firma-recibido',   'inp-firma-recibido',   'btn-clear-recibido');

  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get('id');

  if (formId) {
    await cargarFormularioExistente(formId);
  } else {
    await generarSiguienteNumero(profile.id);
    autoFillFecha();

    const tbody = document.getElementById('items-tbody');
    if (tbody) tbody.innerHTML = '';
    agregarFila();
    agregarFila();
    agregarFila();

    restaurarBorradorLocal();

    const debouncedSave = window.debounce ? window.debounce(guardarBorradorLocal, 500) : guardarBorradorLocal;
    document.addEventListener('input', debouncedSave);
    document.addEventListener('change', debouncedSave);
  }

  const btnNuevo = document.getElementById('btn-nuevo');
  if (btnNuevo) btnNuevo.addEventListener('click', () => limpiarFormularioCompleto(profile.id));

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

  const cant   = item ? (parseFloat(item.cantidad) || 0) : 1;
  const precio = item ? (parseFloat(item.precio)   || 0) : 0;
  const total  = (cant * precio).toFixed(2);

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="number" class="inp-cantidad" value="${cant}" min="1" style="width:100%"></td>
    <td><input type="text" class="inp-descripcion" value="${item ? escHtml(item.descripcion) : ''}" style="width:100%"></td>
    <td><input type="number" class="inp-precio" value="${precio}" step="0.01" style="width:100%"></td>
    <td class="td-total">${total}</td>
    <td><button type="button" class="btn-remove-row" title="Eliminar fila" style="background:var(--danger);color:white;border:none;border-radius:4px;padding:2px 7px;cursor:pointer;font-size:0.8rem;">✕</button></td>
  `;

  tbody.appendChild(tr);

  tr.querySelector('.btn-remove-row').addEventListener('click', () => {
    if (window.hapticFeedback) window.hapticFeedback([30]);
    tr.remove();
    recalcularTotal();
  });

  const recalcularFila = () => {
    const c = parseFloat(tr.querySelector('.inp-cantidad').value) || 0;
    const p = parseFloat(tr.querySelector('.inp-precio').value)   || 0;
    tr.querySelector('.td-total').textContent = (c * p).toFixed(2);
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
    // Número global por empresa, no por técnico
    const { data, error } = await window.supabaseClient
      .from('formularios_materiales')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0) nextNum = (data[0].numero || 0) + 1;

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

    const tipoVal = data.tipo_solicitud || 'pedido';
    const rad = document.querySelector(`input[name="tipo_solicitud"][value="${tipoVal}"]`);
    if (rad) {
      rad.checked = true;
      rad.dispatchEvent(new Event('change'));
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
    const fDesp = data.firma_despachado || data.firma_interviniente;
    const fRec  = data.firma_recibido   || data.firma_cliente;
    if (fDesp) document.getElementById('canvas-firma-despachado')?.loadSignature?.(fDesp);
    if (fRec)  document.getElementById('canvas-firma-recibido')?.loadSignature?.(fRec);

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

  const tipo_solicitud = document.querySelector('input[name="tipo_solicitud"]:checked')?.value || 'pedido';

  return {
    tipo_solicitud,
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

/* ── Construir payload compatible con Supabase schema ── */
function prepararPayloadMateriales(datos) {
  const payload = { ...datos };
  const fDesp = datos.firma_despachado || '';
  const fRec  = datos.firma_recibido   || '';

  // Map signature keys to standard schema column names (firma_interviniente/firma_cliente)
  payload.firma_interviniente = fDesp;
  payload.firma_cliente       = fRec;

  // Delete non-existent column keys that cause schema cache error
  delete payload.firma_despachado;
  delete payload.firma_recibido;

  return payload;
}

async function obtenerSiguienteNumeroMateriales() {
  try {
    const { data } = await window.supabaseClient
      .from('formularios_materiales')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1);
    return (data && data.length > 0 && data[0].numero) ? data[0].numero + 1 : 1;
  } catch (_) {
    return 1;
  }
}

async function insertarMaterialesConRetry(payload, maxIntentos = 5) {
  let intento = 0;
  while (intento < maxIntentos) {
    intento++;
    const nextNum = await obtenerSiguienteNumeroMateriales();
    payload.numero = nextNum;

    const { error } = await window.supabaseClient
      .from('formularios_materiales')
      .insert(payload);

    if (!error) {
      const numeroEl = document.getElementById('form-numero');
      if (numeroEl) {
        numeroEl.textContent = nextNum;
        numeroEl.dataset.value = nextNum;
      }
      return { ok: true, numero: nextNum };
    }

    const isDuplicate = error.message && (
      error.message.includes('unique constraint') ||
      error.message.includes('duplicate key') ||
      error.message.includes('numero_key') ||
      error.code === '23505'
    );

    if (!isDuplicate || intento >= maxIntentos) {
      throw error;
    }
    await new Promise(r => setTimeout(r, 150));
  }
}

/* ── Guardar formulario ── */
async function guardarFormulario(usuarioId, formId) {
  const datos = recolectarDatos();
  datos.usuario_id = usuarioId;

  const payload = prepararPayloadMateriales(datos);

  const statusEl = document.getElementById('save-status');
  function showStatus(msg, type = '') {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.className = 'visible ' + type;
      setTimeout(() => { statusEl.className = ''; }, 3500);
    }
    if (window.showToast) {
      window.showToast(msg, type === 'success' ? 'success' : (type === 'error' ? 'error' : 'info'));
    }
  }

  showStatus('Guardando...');

  try {
    if (formId) {
      const { error } = await window.supabaseClient
        .from('formularios_materiales')
        .update(payload)
        .eq('id', formId);
      if (error) throw error;
      limpiarBorradorLocal();
      showStatus('✅ Actualizado exitosamente.', 'success');
    } else {
      const res = await insertarMaterialesConRetry(payload);
      limpiarBorradorLocal();
      showStatus(`✅ Guardado exitosamente (No. ${res.numero}).`, 'success');
    }
  } catch (err) {
    console.error('Error guardando:', err);

    // Automatic Fallback Retry if any column fails
    if (err.message && err.message.includes('column')) {
      try {
        const fallback = { ...payload };
        delete fallback.firma_interviniente;
        delete fallback.firma_cliente;
        if (formId) {
          await window.supabaseClient.from('formularios_materiales').update(fallback).eq('id', formId);
        } else {
          await window.supabaseClient.from('formularios_materiales').insert(fallback);
        }
        limpiarBorradorLocal();
        showStatus('✅ Guardado exitosamente.', 'success');
        return;
      } catch (fallbackErr) {
        showStatus('❌ Error: ' + fallbackErr.message, 'error');
        return;
      }
    }

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
    const rect = canvas.getBoundingClientRect();
    const w = (rect.width && rect.width > 0) ? rect.width : (canvas.offsetWidth || 300);
    const h = (rect.height && rect.height > 0) ? rect.height : (canvas.offsetHeight || 125);
    const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(canvas.width,  ((clientX - rect.left) / w) * canvas.width)),
      y: Math.max(0, Math.min(canvas.height, ((clientY - rect.top)  / h) * canvas.height))
    };
  }

  function saveSignatureValue() {
    if (window.compressCanvas) {
      input.value = window.compressCanvas(canvas, 0.72);
    } else {
      try {
        input.value = canvas.toDataURL('image/png');
      } catch (_) {
        input.value = '';
      }
    }
  }

  function startDrawing(e) {
    if (e.cancelable) e.preventDefault();
    drawing = true;
    lastPos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(lastPos.x, lastPos.y);
    ctx.stroke();
    saveSignatureValue();
  }

  function draw(e) {
    if (!drawing) return;
    if (e.cancelable) e.preventDefault();
    const newPos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.stroke();
    lastPos = newPos;
  }

  function stopDrawing() {
    if (drawing) {
      drawing = false;
      saveSignatureValue();
    }
  }

  canvas.addEventListener('mousedown',  startDrawing);
  canvas.addEventListener('mousemove',  draw);
  canvas.addEventListener('mouseup',    stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove',  draw,         { passive: false });
  canvas.addEventListener('touchend',   stopDrawing,  { passive: true });
  canvas.addEventListener('touchcancel',stopDrawing,  { passive: true });

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
