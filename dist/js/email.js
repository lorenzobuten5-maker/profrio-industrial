/**
 * email.js
 * Dependencia: EmailJS (window.emailjs)
 */

const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID_INTERVENCION = 'TU_TEMPLATE_INTERVENCION';
const EMAILJS_TEMPLATE_ID_MATERIALES = 'TU_TEMPLATE_MATERIALES';
const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY';

if (window.emailjs) {
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
}

async function sendIntervencionEmail(destinatario, formData) {
  if (!window.emailjs) {
    alert("EmailJS no está cargado.");
    return;
  }
  
  const params = {
    to_email: destinatario,
    cliente: formData.cliente,
    observaciones: formData.observaciones,
    // Add rest of parameters as mapped in EmailJS template
    mensaje: `Formulario de Intervención para ${formData.cliente}. Tipo de servicio: ${formData.tipo_servicio}.`
  };
  
  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_INTERVENCION, params);
    alert('Email enviado exitosamente.');
  } catch (err) {
    console.error('Error enviando email:', err);
    alert('Error enviando email: ' + JSON.stringify(err));
  }
}

async function sendMaterialesEmail(destinatario, formData) {
  if (!window.emailjs) {
    alert("EmailJS no está cargado.");
    return;
  }
  
  const params = {
    to_email: destinatario,
    cliente: formData.cliente,
    total: formData.total,
    mensaje: `Solicitud de Materiales para ${formData.cliente}. Total: $${formData.total}.`
  };
  
  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_MATERIALES, params);
    alert('Email enviado exitosamente.');
  } catch (err) {
    console.error('Error enviando email:', err);
    alert('Error enviando email: ' + JSON.stringify(err));
  }
}

window.sendIntervencionEmail = sendIntervencionEmail;
window.sendMaterialesEmail = sendMaterialesEmail;
