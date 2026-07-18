/**
 * formulario-materiales.js
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
  
  const btnAdd = document.getElementById('btn-add-item');
  if (btnAdd) {
    btnAdd.addEventListener('click', agregarFila);
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
    btnPdf.addEventListener('click', () => window.generatePDFMateriales?.());
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
      window.sendMaterialesEmail?.(destino, formData);
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

function agregarFila(item = null) {
  const tbody = document.getElementById('items-tbody');
  if (!tbody) return;
  
  const tr = document.createElement('tr');
  
  tr.innerHTML = `
    <td><input type="number" class="inp-cantidad" value="${item ? item.cantidad : 1}" min="1" style="width:100%"></td>
    <td><input type="text" class="inp-descripcion" value="${item ? item.descripcion : ''}" style="width:100%"></td>
    <td><input type="number" class="inp-precio" value="${item ? item.precio : 0}" step="0.01" style="width:100%"></td>
    <td class="td-total">${item ? (item.cantidad * item.precio).toFixed(2) : '0.00'}</td>
    <td><button type="button" class="btn-remove">X</button></td>
  `;
  
  tbody.appendChild(tr);
  
  tr.querySelector('.btn-remove').addEventListener('click', () => {
    tr.remove();
    recalcularTotal();
  });
  
  const recalcularFila = () => {
    const cant = parseFloat(tr.querySelector('.inp-cantidad').value) || 0;
    const precio = parseFloat(tr.querySelector('.inp-precio').value) || 0;
    tr.querySelector('.td-total').textContent = (cant * precio).toFixed(2);
    recalcularTotal();
  };
  
  tr.querySelector('.inp-cantidad').addEventListener('input', recalcularFila);
  tr.querySelector('.inp-precio').addEventListener('input', recalcularFila);
  recalcularTotal();
}

function recalcularTotal() {
  const totales = Array.from(document.querySelectorAll('.td-total')).map(td => parseFloat(td.textContent) || 0);
  const totalGeneral = totales.reduce((a, b) => a + b, 0);
  const display = document.getElementById('total-display');
  if (display) display.textContent = totalGeneral.toFixed(2);
}

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
      .from('formularios_materiales')
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
    
    document.getElementById('inp-fecha-dia').value = data.fecha_dia || '';
    document.getElementById('inp-fecha-mes').value = data.fecha_mes || '';
    document.getElementById('inp-fecha-anio').value = data.fecha_anio || '';
    document.getElementById('inp-cliente').value = data.cliente || '';
    document.getElementById('inp-direccion').value = data.direccion || '';
    document.getElementById('inp-telefono').value = data.telefono || '';
    document.getElementById('inp-despachado').value = data.despachado_por || '';
    document.getElementById('inp-recibido').value = data.recibido_conforme || '';
    
    document.getElementById('ta-observaciones').value = data.observaciones || '';
    fotosArray = data.fotos || [];
    renderPhotos();
    
    const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
    if (items && Array.isArray(items)) {
      items.forEach(item => agregarFila(item));
    }
    
    const totalEl = document.getElementById('total-display');
    if (totalEl) totalEl.textContent = parseFloat(data.total || 0).toFixed(2);
    
  } catch (err) {
    console.error('Error cargando formulario:', err);
  }
}

function recolectarDatos() {
  const items = [];
  document.querySelectorAll('#items-tbody tr').forEach(tr => {
    items.push({
      cantidad: parseFloat(tr.querySelector('.inp-cantidad').value) || 0,
      descripcion: tr.querySelector('.inp-descripcion').value || '',
      precio: parseFloat(tr.querySelector('.inp-precio').value) || 0
    });
  });
  
  return {
    fecha_dia: parseInt(document.getElementById('inp-fecha-dia')?.value) || null,
    fecha_mes: parseInt(document.getElementById('inp-fecha-mes')?.value) || null,
    fecha_anio: parseInt(document.getElementById('inp-fecha-anio')?.value) || null,
    cliente: document.getElementById('inp-cliente')?.value || '',
    direccion: document.getElementById('inp-direccion')?.value || '',
    telefono: document.getElementById('inp-telefono')?.value || '',
    items: JSON.stringify(items),
    total: parseFloat(document.getElementById('total-display')?.textContent) || 0,
    despachado_por: document.getElementById('inp-despachado')?.value || '',
    recibido_conforme: document.getElementById('inp-recibido')?.value || '',
    observaciones: document.getElementById('ta-observaciones')?.value || '',
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
        .from('formularios_materiales')
        .update(datos)
        .eq('id', formId);
      if (error) throw error;
      if (statusEl) statusEl.textContent = 'Actualizado exitosamente.';
    } else {
      datos.numero = parseInt(document.getElementById('form-numero')?.dataset?.value || '1', 10);
      const { error } = await window.supabaseClient
        .from('formularios_materiales')
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

window.recolectarDatosMateriales = recolectarDatos;
