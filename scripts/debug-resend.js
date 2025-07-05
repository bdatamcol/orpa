/**
 * Script de diagnóstico para Resend
 * Identifica problemas específicos con la configuración
 */

const { Resend } = require('resend');

// Configuración
const RESEND_API_KEY = 're_TzHs3o7J_BHRQZAduxQfpJgniyPW2noXV';

console.log('🔍 Diagnóstico de Resend');
console.log('========================');
console.log('API Key:', RESEND_API_KEY.substring(0, 10) + '...');

async function debugResend() {
  try {
    const resend = new Resend(RESEND_API_KEY);
    
    console.log('\n1. Probando con dominio verificado de Resend...');
    
    // Intentar con el dominio onboarding de Resend (siempre funciona)
    const result1 = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Test desde ORPA',
      html: '<p>Este es un test desde ORPA usando el dominio de Resend</p>'
    });
    
    if (result1.error) {
      console.log('❌ Error con dominio Resend:', result1.error);
    } else {
      console.log('✅ Éxito con dominio Resend:', result1.data?.id);
    }
    
    console.log('\n2. Probando con nuestro dominio...');
    
    // Intentar con nuestro dominio
    const result2 = await resend.emails.send({
      from: 'ORPA <soporte@orpainversiones.com>',
      to: ['delivered@resend.dev'],
      subject: 'Test desde ORPA - Dominio Propio',
      html: '<p>Este es un test desde ORPA usando nuestro dominio</p>'
    });
    
    if (result2.error) {
      console.log('❌ Error con nuestro dominio:', result2.error);
      console.log('\n💡 SOLUCIÓN:');
      console.log('El dominio orpainversiones.com no está verificado en Resend.');
      console.log('Opciones:');
      console.log('1. Verificar el dominio en https://resend.com/domains');
      console.log('2. Usar el dominio de Resend temporalmente');
      console.log('3. Usar un dominio ya verificado');
    } else {
      console.log('✅ Éxito con nuestro dominio:', result2.data?.id);
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
    console.log('\n🔧 Posibles causas:');
    console.log('1. API Key inválida');
    console.log('2. Problema de red');
    console.log('3. Límites de rate limiting');
  }
}

debugResend();