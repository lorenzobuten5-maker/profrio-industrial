/**
 * formulario-intervencion.js
 */

let fotosArray = [];
let currentFormId = null;
const DRAFT_KEY = 'pf_draft_intervencion';

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

    const mapeo = {
      'inp-nombre': data.nombre,
      'inp-jornada': data.jornada,
      'inp-desplazamiento': data.num_desplazamiento,
      'inp-intervinientes': data.num_intervinientes,
      'inp-cliente': data.cliente,
      'inp-direccion': data.direccion,
      'inp-telefono': data.telefono,
      'chk-tecnico': data.chk_tecnico,
      'chk-jefe-obra': data.chk_jefe_obra,
      'chk-jefe-equipo': data.chk_jefe_equipo,
      'inp-horas-tecnico': data.horas_tecnico,
      'inp-horas-jefe-obra': data.horas_jefe_obra,
      'inp-horas-jefe-equipo': data.horas_jefe_equipo,
      'chk-aires': data.chk_aires,
      'chk-rack': data.chk_rack,
      'inp-nivel-liquido': data.inp_nivel_liquido,
      'inp-nivel-aceite': data.inp_nivel_aceite,
      'chk-correccion-fuga': data.chk_correccion_fuga,
      'chk-carga-refrigerante': data.chk_carga_refrigerante,
      'chk-cambio-compresor': data.chk_cambio_compresor,
      'chk-mant-aa': data.chk_mant_aa,
      'chk-mant-nevera': data.chk_mant_nevera,
      'chk-cambio-solenoide': data.chk_cambio_solenoide,
      'chk-cambio-abanico': data.chk_cambio_abanico,
      'inp-temp-congelado': data.temp_congelado,
      'inp-temp-deli-queso': data.temp_deli_queso,
      'inp-temp-deli-carne': data.temp_deli_carne,
      'inp-temp-salami': data.temp_salami,
      'inp-temp-yogurt': data.temp_yogurt,
      'inp-temp-vegetales-nev': data.temp_vegetales,
      'inp-temp-jugos': data.temp_jugos,
      'inp-cf-vegetales': data.cf_vegetales,
      'inp-cf-congelado': data.cf_congelado,
      'inp-cf-carnes': data.cf_carnes,
      'inp-cf-pescados': data.cf_pescados,
      'inp-cf-preparacion': data.cf_preparacion,
      'ta-observaciones': data.observaciones,
      'ta-pedido-materiales': data.pedido_materiales
    };

    Object.entries(mapeo).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else if (val !== undefined && val !== null) el.value = val;
    });

    if (data.tipo_servicio) {
      const rad = document.querySelector(`input[name="tipo_servicio"][value="${data.tipo_servicio}"]`);
      if (rad) rad.checked = true;
    }

    if (data.fotos && Array.isArray(data.fotos)) {
      fotosArray = data.fotos;
      renderPhotos();
    }

    if (data.firma_interviniente) document.getElementById('canvas-firma-interviniente')?.loadSignature?.(data.firma_interviniente);
    if (data.firma_cliente) document.getElementById('canvas-firma-cliente')?.loadSignature?.(data.firma_cliente);

    if (window.showToast) {
      window.showToast('📋 Se cargó tu borrador anterior. Usa "Nuevo en Blanco" para limpiar.', 'warning', 4500);
    }
  } catch (_) {}
}

let lastIntervencionBackup = null;

function restaurarBackupIntervencion() {
  if (!lastIntervencionBackup) return;
  const { datos, formId, fotos } = lastIntervencionBackup;

  currentFormId = formId;
  if (formId && window.history && window.history.replaceState) {
    window.history.replaceState({}, '', window.location.pathname + '?id=' + formId);
  }

  const mapeo = {
    'inp-nombre': datos.nombre,
    'inp-jornada': datos.jornada,
    'inp-desplazamiento': datos.num_desplazamiento,
    'inp-intervinientes': datos.num_intervinientes,
    'inp-cliente': datos.cliente,
    'inp-direccion': datos.direccion,
    'inp-telefono': datos.telefono,
    'chk-tecnico': datos.chk_tecnico,
    'chk-jefe-obra': datos.chk_jefe_obra,
    'chk-jefe-equipo': datos.chk_jefe_equipo,
    'inp-horas-tecnico': datos.horas_tecnico,
    'inp-horas-jefe-obra': datos.horas_jefe_obra,
    'inp-horas-jefe-equipo': datos.horas_jefe_equipo,
    'chk-aires': datos.chk_aires,
    'chk-rack': datos.chk_rack,
    'inp-nivel-liquido': datos.inp_nivel_liquido,
    'inp-nivel-aceite': datos.inp_nivel_aceite,
    'chk-correccion-fuga': datos.chk_correccion_fuga,
    'chk-carga-refrigerante': datos.chk_carga_refrigerante,
    'chk-cambio-compresor': datos.chk_cambio_compresor,
    'chk-mant-aa': datos.chk_mant_aa,
    'chk-mant-nevera': datos.chk_mant_nevera,
    'chk-cambio-solenoide': datos.chk_cambio_solenoide,
    'chk-cambio-abanico': datos.chk_cambio_abanico,
    'inp-temp-congelado': datos.temp_congelado,
    'inp-temp-deli-queso': datos.temp_deli_queso,
    'inp-temp-deli-carne': datos.temp_deli_carne,
    'inp-temp-salami': datos.temp_salami,
    'inp-temp-yogurt': datos.temp_yogurt,
    'inp-temp-vegetales-nev': data => data.temp_vegetales,
    'inp-temp-jugos': datos.temp_jugos,
    'inp-cf-vegetales': datos.cf_vegetales,
    'inp-cf-congelado': datos.cf_congelado,
    'inp-cf-carnes': datos.cf_carnes,
    'inp-cf-pescados': datos.cf_pescados,
    'inp-cf-preparacion': datos.cf_preparacion,
    'ta-observaciones': datos.observaciones,
    'ta-pedido-materiales': datos.pedido_materiales
  };

  Object.entries(mapeo).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!val;
    else if (val !== undefined && val !== null) el.value = val;
  });

  if (datos.tipo_servicio) {
    const rad = document.querySelector(`input[name="tipo_servicio"][value="${datos.tipo_servicio}"]`);
    if (rad) rad.checked = true;
  }

  fotosArray = fotos || [];
  renderPhotos();

  if (datos.firma_interviniente) document.getElementById('canvas-firma-interviniente')?.loadSignature?.(datos.firma_interviniente);
  if (datos.firma_cliente) document.getElementById('canvas-firma-cliente')?.loadSignature?.(datos.firma_cliente);

  const btnUndo = document.getElementById('btn-deshacer');
  if (btnUndo) btnUndo.style.display = 'none';

  if (window.showToast) window.showToast('↩️ Formulario restaurado exitosamente', 'success');
}

function limpiarBorradorLocal() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
}

function limpiarFormularioCompleto(usuarioId) {
  // Backup before clear so user can undo
  lastIntervencionBackup = {
    datos: recolectarDatos(),
    formId: currentFormId,
    fotos: [...fotosArray]
  };

  const btnUndo = document.getElementById('btn-deshacer');
  if (btnUndo) btnUndo.style.display = 'inline-flex';

  currentFormId = null;
  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, '', window.location.pathname);
  }
  limpiarBorradorLocal();

  const idsToClear = [
    'inp-nombre', 'inp-jornada', 'inp-desplazamiento', 'inp-intervinientes',
    'inp-cliente', 'inp-direccion', 'inp-telefono', 'inp-horas-tecnico',
    'inp-horas-jefe-obra', 'inp-horas-jefe-equipo', 'inp-nivel-liquido',
    'inp-nivel-aceite', 'inp-temp-congelado', 'inp-temp-deli-queso',
    'inp-temp-deli-carne', 'inp-temp-salami', 'inp-temp-yogurt',
    'inp-temp-vegetales-nev', 'inp-temp-jugos', 'inp-cf-vegetales',
    'inp-cf-congelado', 'inp-cf-carnes', 'inp-cf-pescados', 'inp-cf-preparacion',
    'ta-observaciones', 'ta-pedido-materiales', 'inp-firma-interviniente', 'inp-firma-cliente'
  ];

  idsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const chkIds = [
    'chk-tecnico', 'chk-jefe-obra', 'chk-jefe-equipo', 'chk-aires', 'chk-rack',
    'chk-correccion-fuga', 'chk-carga-refrigerante', 'chk-cambio-compresor',
    'chk-mant-aa', 'chk-mant-nevera', 'chk-cambio-solenoide', 'chk-cambio-abanico'
  ];
  chkIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  document.querySelectorAll('input[name="tipo_servicio"]').forEach(el => el.checked = false);

  document.getElementById('btn-clear-interviniente')?.click();
  document.getElementById('btn-clear-cliente')?.click();

  fotosArray = [];
  renderPhotos();

  if (usuarioId) generarSiguienteNumero(usuarioId);

  if (window.showToast) window.showToast('🧹 Formulario limpio. ¿Fue un error? Presiona ↩️ Deshacer Limpieza', 'warning', 6000);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['empleado', 'jefe']);
  
  const profile = await window.getCurrentProfile?.();
  if (!profile) return;
  
  initPhotos();
  
  // Initialize signature pads
  initSignaturePad('canvas-firma-interviniente', 'inp-firma-interviniente', 'btn-clear-interviniente');
  initSignaturePad('canvas-firma-cliente', 'inp-firma-cliente', 'btn-clear-cliente');

  // Global Haptic Feedback listener for buttons and checkboxes
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .btn, input[type="checkbox"], input[type="radio"]');
    if (target && window.hapticFeedback) {
      window.hapticFeedback([30]);
    }
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  currentFormId = urlParams.get('id') || null;
  
  if (currentFormId) {
    await cargarFormularioExistente(currentFormId);
  } else {
    await generarSiguienteNumero(profile.id);
    restaurarBorradorLocal();

    // Debounced auto-save listener on form edits
    const debouncedSave = window.debounce ? window.debounce(guardarBorradorLocal, 500) : guardarBorradorLocal;
    document.addEventListener('input', debouncedSave);
    document.addEventListener('change', debouncedSave);
  }

  const btnNuevo = document.getElementById('btn-nuevo');
  if (btnNuevo) btnNuevo.addEventListener('click', () => limpiarFormularioCompleto(profile.id));

  const btnUndo = document.getElementById('btn-deshacer');
  if (btnUndo) btnUndo.addEventListener('click', restaurarBackupIntervencion);
  
  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => guardarFormulario(profile.id));
  }
  
  const btnImprimir = document.getElementById('btn-imprimir');
  if (btnImprimir) {
    btnImprimir.addEventListener('click', () => window.printForm?.() || window.print());
  }
  
  const btnPdf = document.getElementById('btn-pdf');
  if (btnPdf) {
    btnPdf.addEventListener('click', () => window.generatePDFIntervencion?.());
  }
  
  const btnEmail = document.getElementById('btn-email');
  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      document.getElementById('email-modal').style.display = 'block';
    });
  }
  
  const btnEnviarEmail = document.getElementById('btn-enviar-email');
  if (btnEnviarEmail) {
    btnEnviarEmail.addEventListener('click', () => {
      const destino = document.getElementById('email-destino').value;
      const formData = recolectarDatos();
      window.sendIntervencionEmail?.(destino, formData);
      document.getElementById('email-modal').style.display = 'none';
    });
  }
  
  const btnCancelEmail = document.getElementById('btn-cancel-email');
  if (btnCancelEmail) {
    btnCancelEmail.addEventListener('click', () => {
      document.getElementById('email-modal').style.display = 'none';
    });
  }
});

async function generarSiguienteNumero(usuarioId) {
  try {
    // Número global por empresa, no por técnico
    const { data, error } = await window.supabaseClient
      .from('formularios_intervencion')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    let nextNum = 1;
    if (data && data.length > 0) {
      nextNum = (data[0].numero || 0) + 1;
    }
    
    const numeroEl = document.getElementById('form-numero');
    if (numeroEl) {
      numeroEl.textContent = nextNum;
      numeroEl.dataset.value = nextNum;
    }
  } catch (err) {
    console.error('Error calculando número:', err);
  }
}

async function cargarFormularioExistente(id) {
  try {
    const { data, error } = await window.supabaseClient
      .from('formularios_intervencion')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return;
    
    const numeroEl = document.getElementById('form-numero');
    if (numeroEl) {
      numeroEl.textContent = data.numero;
      numeroEl.dataset.value = data.numero;
    }
    
    const mapeo = {
      'inp-nombre': data.nombre,
      'inp-jornada': data.jornada,
      'inp-desplazamiento': data.num_desplazamiento,
      'inp-intervinientes': data.num_intervinientes,
      'inp-cliente': data.cliente,
      'inp-direccion': data.direccion,
      'inp-telefono': data.telefono,
      'chk-tecnico': data.chk_tecnico,
      'chk-jefe-obra': data.chk_jefe_obra,
      'chk-jefe-equipo': data.chk_jefe_equipo,
      'inp-horas-tecnico': data.horas_tecnico,
      'inp-horas-jefe-obra': data.horas_jefe_obra,
      'inp-horas-jefe-equipo': data.horas_jefe_equipo,
      'chk-aires': data.chk_aires,
      'chk-rack': data.chk_rack,
      'inp-nivel-liquido': data.inp_nivel_liquido,
      'inp-nivel-aceite': data.inp_nivel_aceite,
      'chk-correccion-fuga': data.chk_correccion_fuga,
      'chk-carga-refrigerante': data.chk_carga_refrigerante,
      'chk-cambio-compresor': data.chk_cambio_compresor,
      'chk-mant-aa': data.chk_mant_aa,
      'chk-mant-nevera': data.chk_mant_nevera,
      'chk-cambio-solenoide': data.chk_cambio_solenoide,
      'chk-cambio-abanico': data.chk_cambio_abanico,
      'inp-temp-congelado': data.temp_congelado,
      'inp-temp-deli-queso': data.temp_deli_queso,
      'inp-temp-deli-carne': data.temp_deli_carne,
      'inp-temp-salami': data.temp_salami,
      'inp-temp-yogurt': data.temp_yogurt,
      'inp-temp-vegetales-nev': data.temp_vegetales,
      'inp-temp-jugos': data.temp_jugos,
      'inp-cf-vegetales': data.cf_vegetales,
      'inp-cf-congelado': data.cf_congelado,
      'inp-cf-carnes': data.cf_carnes,
      'inp-cf-pescados': data.cf_pescados,
      'inp-cf-preparacion': data.cf_preparacion,
      'ta-observaciones': data.observaciones,
      'ta-pedido-materiales': data.pedido_materiales,
      'inp-firma-interviniente': data.firma_interviniente,
      'inp-firma-cliente': data.firma_cliente
    };
    
    for (const [idEl, val] of Object.entries(mapeo)) {
      const el = document.getElementById(idEl);
      if (el) {
        if (el.type === 'checkbox') el.checked = !!val;
        else el.value = val || '';
      }
    }
    
    fotosArray = data.fotos || [];
    renderPhotos();
    
    if (data.tipo_servicio === 'Electricidad' && document.getElementById('radio-electricidad')) document.getElementById('radio-electricidad').checked = true;
    if (data.tipo_servicio === 'Frio Comercial' && document.getElementById('radio-frio-comercial')) document.getElementById('radio-frio-comercial').checked = true;
    if (data.tipo_servicio === 'Frio Industrial' && document.getElementById('radio-frio-industrial')) document.getElementById('radio-frio-industrial').checked = true;
    
    // Load signatures onto the canvases
    document.getElementById('canvas-firma-interviniente')?.loadSignature?.(data.firma_interviniente);
    document.getElementById('canvas-firma-cliente')?.loadSignature?.(data.firma_cliente);
    
  } catch (err) {
    console.error('Error cargando formulario:', err);
  }
}

function recolectarDatos() {
  const getVal = id => document.getElementById(id)?.value || null;
  const getChk = id => document.getElementById(id)?.checked || false;
  
  let tipoServicio = null;
  if (document.getElementById('radio-electricidad')?.checked) tipoServicio = 'Electricidad';
  if (document.getElementById('radio-frio-comercial')?.checked) tipoServicio = 'Frio Comercial';
  if (document.getElementById('radio-frio-industrial')?.checked) tipoServicio = 'Frio Industrial';

  return {
    nombre: getVal('inp-nombre'),
    jornada: getVal('inp-jornada'),
    num_desplazamiento: getVal('inp-desplazamiento'),
    num_intervinientes: getVal('inp-intervinientes'),
    tipo_servicio: tipoServicio,
    cliente: getVal('inp-cliente'),
    direccion: getVal('inp-direccion'),
    telefono: getVal('inp-telefono'),
    chk_tecnico: getChk('chk-tecnico'),
    chk_jefe_obra: getChk('chk-jefe-obra'),
    chk_jefe_equipo: getChk('chk-jefe-equipo'),
    horas_tecnico: getVal('inp-horas-tecnico'),
    horas_jefe_obra: getVal('inp-horas-jefe-obra'),
    horas_jefe_equipo: getVal('inp-horas-jefe-equipo'),
    chk_aires: getChk('chk-aires'),
    chk_rack: getChk('chk-rack'),
    inp_nivel_liquido: getVal('inp-nivel-liquido'),
    inp_nivel_aceite: getVal('inp-nivel-aceite'),
    chk_correccion_fuga: getChk('chk-correccion-fuga'),
    chk_carga_refrigerante: getChk('chk-carga-refrigerante'),
    'chk_cambio_compresor': getChk('chk-cambio-compresor'),
    chk_mant_aa: getChk('chk-mant-aa'),
    chk_mant_nevera: getChk('chk-mant-nevera'),
    chk_cambio_solenoide: getChk('chk-cambio-solenoide'),
    chk_cambio_abanico: getChk('chk-cambio-abanico'),
    temp_congelado: getVal('inp-temp-congelado'),
    temp_deli_queso: getVal('inp-temp-deli-queso'),
    temp_deli_carne: getVal('inp-temp-deli-carne'),
    temp_salami: getVal('inp-temp-salami'),
    temp_yogurt: getVal('inp-temp-yogurt'),
    temp_vegetales: getVal('inp-temp-vegetales-nev'),
    temp_jugos: getVal('inp-temp-jugos'),
    cf_vegetales: getVal('inp-cf-vegetales'),
    cf_congelado: getVal('inp-cf-congelado'),
    cf_carnes: getVal('inp-cf-carnes'),
    cf_pescados: getVal('inp-cf-pescados'),
    cf_preparacion: getVal('inp-cf-preparacion'),
    observaciones: getVal('ta-observaciones'),
    pedido_materiales: getVal('ta-pedido-materiales'),
    firma_interviniente: getVal('inp-firma-interviniente'),
    firma_cliente: getVal('inp-firma-cliente'),
    fotos: fotosArray
  };
}

async function obtenerSiguienteNumeroIntervencion() {
  try {
    const { data } = await window.supabaseClient
      .from('formularios_intervencion')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1);
    return (data && data.length > 0 && data[0].numero) ? data[0].numero + 1 : 1;
  } catch (_) {
    return 1;
  }
}

async function insertarIntervencionConRetry(datos, maxIntentos = 5) {
  let intento = 0;
  while (intento < maxIntentos) {
    intento++;
    const nextNum = await obtenerSiguienteNumeroIntervencion();
    datos.numero = nextNum;

    const { data, error } = await window.supabaseClient
      .from('formularios_intervencion')
      .insert(datos)
      .select('id')
      .single();

    if (!error && data) {
      const numeroEl = document.getElementById('form-numero');
      if (numeroEl) {
        numeroEl.textContent = nextNum;
        numeroEl.dataset.value = nextNum;
      }
      return { ok: true, id: data.id, numero: nextNum };
    }

    const isDuplicate = error && error.message && (
      error.message.includes('unique constraint') ||
      error.message.includes('duplicate key') ||
      error.message.includes('numero_key') ||
      error.code === '23505'
    );

    if (!isDuplicate || intento >= maxIntentos) {
      throw error || new Error('Error al insertar formulario');
    }
    // Short pause before retrying
    await new Promise(r => setTimeout(r, 150));
  }
}

async function guardarFormulario(usuarioId) {
  const datos = recolectarDatos();
  datos.usuario_id = usuarioId;
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
    if (currentFormId) {
      const { error } = await window.supabaseClient
        .from('formularios_intervencion')
        .update(datos)
        .eq('id', currentFormId);
      if (error) throw error;
      limpiarBorradorLocal();
      showStatus('✅ Actualizado exitosamente.', 'success');
    } else {
      const res = await insertarIntervencionConRetry(datos);
      currentFormId = res.id;
      if (window.history && window.history.replaceState && res.id) {
        window.history.replaceState({}, '', window.location.pathname + '?id=' + res.id);
      }
      limpiarBorradorLocal();
      showStatus(`✅ Guardado exitosamente (No. ${res.numero}).`, 'success');
    }
  } catch (err) {
    console.error('Error guardando:', err);
    showStatus('❌ Error: ' + err.message, 'error');
  }
}

function initPhotos() {
  const btnCamera = document.getElementById('btn-camera');
  const btnUpload = document.getElementById('btn-upload');
  const inpCamera = document.getElementById('inp-camera');
  const inpUpload = document.getElementById('inp-upload');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');

  if (btnCamera && inpCamera) {
    btnCamera.addEventListener('click', () => inpCamera.click());
    inpCamera.addEventListener('change', handlePhotoSelection);
  }
  if (btnUpload && inpUpload) {
    btnUpload.addEventListener('click', () => inpUpload.click());
    inpUpload.addEventListener('change', handlePhotoSelection);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('active');
    });
  }

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
          let width = img.width;
          let height = img.height;
          const max_size = 800;
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.6);
          fotosArray.push(base64);
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
      const lightbox = document.getElementById('lightbox-modal');
      const lightboxImg = document.getElementById('lightbox-img');
      if (lightbox && lightboxImg) {
        lightboxImg.src = base64;
        lightbox.classList.add('active');
      }
    });
    
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
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

window.recolectarDatosIntervencion = recolectarDatos;

/* ──────────────────────────────────────────
   CANVAS SIGNATURE DRAW HELPER
   ────────────────────────────────────────── */
function initSignaturePad(canvasId, inputId, clearBtnId) {
  const canvas = document.getElementById(canvasId);
  const input = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);
  if (!canvas || !input) return;

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#0C2340';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

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

  // Mouse
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing, { passive: true });
  canvas.addEventListener('touchcancel', stopDrawing, { passive: true });

  // Clear
  clearBtn?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    input.value = '';
  });

  // Load Base64 onto canvas
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
