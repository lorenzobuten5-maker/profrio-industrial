/**
 * formulario-intervencion.js
 */

let fotosArray = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['empleado', 'jefe']);
  
  const profile = await window.getCurrentProfile?.();
  if (!profile) return;
  
  initPhotos();
  
  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get('id');
  
  if (formId) {
    await cargarFormularioExistente(formId);
  } else {
    await generarSiguienteNumero(profile.id);
  }
  
  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => guardarFormulario(profile.id, formId));
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
    const { data, error } = await window.supabaseClient
      .from('formularios_intervencion')
      .select('numero')
      .eq('usuario_id', usuarioId)
      .order('numero', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    let nextNum = 1;
    if (data && data.length > 0) {
      nextNum = data[0].numero + 1;
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

async function guardarFormulario(usuarioId, formId) {
  const datos = recolectarDatos();
  datos.usuario_id = usuarioId;
  const statusEl = document.getElementById('save-status');
  if (statusEl) statusEl.textContent = 'Guardando...';
  
  try {
    if (formId) {
      const { error } = await window.supabaseClient
        .from('formularios_intervencion')
        .update(datos)
        .eq('id', formId);
      if (error) throw error;
      if (statusEl) statusEl.textContent = 'Actualizado exitosamente.';
    } else {
      datos.numero = parseInt(document.getElementById('form-numero')?.dataset?.value || '1', 10);
      const { error } = await window.supabaseClient
        .from('formularios_intervencion')
        .insert(datos);
      if (error) throw error;
      if (statusEl) statusEl.textContent = 'Guardado exitosamente.';
    }
  } catch (err) {
    console.error('Error guardando:', err);
    if (statusEl) statusEl.textContent = 'Error: ' + err.message;
  }
}

function initPhotos() {
  const btnCamera = document.getElementById('btn-camera');
  const btnUpload = document.getElementById('btn-upload');
  const inpCamera = document.getElementById('inp-camera');
  const inpUpload = document.getElementById('inp-upload');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
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
          const max_size = 800; // max size in px
          
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
