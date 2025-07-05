/**
 * Script de prueba para el servicio de email con Resend
 * Verifica la configuración y funcionalidad del nuevo sistema
 */

const { Resend } = require('resend');
const crypto = require('crypto');

// Configuración
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_TzHs3o7J_BHRQZAduxQfpJgniyPW2noXV';
const TEST_EMAIL = 'test@resend.dev'; // Email especial de Resend para pruebas
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'soporte@orpainversiones.com';

console.log('🚀 Iniciando pruebas del servicio Resend Email...');
console.log('=' .repeat(60));

/**
 * Prueba 1: Verificar configuración
 */
async function testConfiguration() {
  console.log('\n📋 1. Verificando configuración...');
  
  const config = {
    'RESEND_API_KEY': RESEND_API_KEY ? '✅ Configurado' : '❌ Faltante',
    'SUPPORT_EMAIL': SUPPORT_EMAIL ? '✅ Configurado' : '❌ Faltante'
  };
  
  console.table(config);
  
  const allConfigured = Object.values(config).every(status => status.includes('✅'));
  
  if (allConfigured) {
    console.log('✅ Configuración completa');
    return true;
  } else {
    console.log('❌ Configuración incompleta');
    return false;
  }
}

/**
 * Prueba 2: Probar conexión con Resend
 */
async function testResendConnection() {
  console.log('\n🔗 2. Probando conexión con Resend...');
  
  try {
    const resend = new Resend(RESEND_API_KEY);
    
    // Enviar email de prueba
    const result = await resend.emails.send({
      from: 'ORPA <onboarding@resend.dev>',
      to: [TEST_EMAIL],
      subject: 'Test de Conexión - ORPA Resend',
      html: `
        <h2>🧪 Test de Conexión Exitoso</h2>
        <p>Este email confirma que la conexión con Resend está funcionando correctamente.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>API Key:</strong> ${RESEND_API_KEY.substring(0, 8)}...</p>
      `,
      text: `Test de Conexión Exitoso\n\nEste email confirma que la conexión con Resend está funcionando correctamente.\n\nTimestamp: ${new Date().toISOString()}`
    });
    
    if (result.error) {
      console.log('❌ Error de conexión:', result.error.message);
      return false;
    }
    
    console.log('✅ Conexión exitosa con Resend');
    console.log(`📧 Email ID: ${result.data?.id}`);
    return true;
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

/**
 * Prueba 3: Generar token de prueba
 */
function testTokenGeneration() {
  console.log('\n🔑 3. Probando generación de tokens...');
  
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora
    
    console.log('✅ Token generado exitosamente');
    console.log(`🔐 Token: ${token.substring(0, 16)}...`);
    console.log(`⏰ Expira: ${expiresAt.toISOString()}`);
    
    return { token, expiresAt };
    
  } catch (error) {
    console.log('❌ Error generando token:', error.message);
    return null;
  }
}

/**
 * Prueba 4: Enviar email de recuperación completo
 */
async function testPasswordResetEmail() {
  console.log('\n📧 4. Probando email de recuperación completo...');
  
  try {
    const resend = new Resend(RESEND_API_KEY);
    const token = crypto.randomBytes(32).toString('hex');
    const testCedula = '12345678';
    const resetUrl = `http://localhost:3000/auth/reset-password-direct?token=${token}&email=${encodeURIComponent(TEST_EMAIL)}`;
    
    const emailTemplate = {
      subject: 'Recuperación de Contraseña - ORPA (Prueba)',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Recuperación de Contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f8f9fa; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #333; }
            .button { display: inline-block; background: #f8c327; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">ORPA</div>
              <h1>🧪 Prueba de Recuperación de Contraseña</h1>
            </div>
            
            <p>Este es un <strong>email de prueba</strong> para verificar el sistema de recuperación.</p>
            <p><strong>Cédula:</strong> ${testCedula}</p>
            <p><strong>Enviado por:</strong> Resend</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">🔑 Restablecer Contraseña (Prueba)</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Esto es una prueba:</strong>
              <ul>
                <li>No uses este enlace en producción</li>
                <li>El token expira en 1 hora</li>
                <li>Sistema enviado por Resend</li>
              </ul>
            </div>
            
            <p><strong>URL completa:</strong></p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; font-family: monospace;">${resetUrl}</p>
            
            <hr style="margin: 30px 0;">
            <p style="text-align: center; color: #666; font-size: 14px;">
              📧 Enviado por ORPA usando Resend<br>
              🕒 ${new Date().toISOString()}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
ORPA - Prueba de Recuperación de Contraseña

Este es un email de prueba para verificar el sistema de recuperación.

Cédula: ${testCedula}
Enviado por: Resend

Para restablecer la contraseña (PRUEBA), visita:
${resetUrl}

Importante:
- Esto es una prueba
- No uses este enlace en producción
- El token expira en 1 hora

Enviado: ${new Date().toISOString()}
      `
    };
    
    const result = await resend.emails.send({
      from: 'ORPA <onboarding@resend.dev>',
      to: [TEST_EMAIL],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      tags: [
        { name: 'category', value: 'password-reset-test' },
        { name: 'cedula', value: testCedula }
      ]
    });
    
    if (result.error) {
      console.log('❌ Error enviando email:', result.error.message);
      return false;
    }
    
    console.log('✅ Email de recuperación enviado exitosamente');
    console.log(`📧 Email ID: ${result.data?.id}`);
    console.log(`🔗 Reset URL: ${resetUrl.substring(0, 80)}...`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error enviando email:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function runTests() {
  console.log('🧪 PRUEBAS DEL SERVICIO RESEND EMAIL');
  console.log('Verificando la nueva implementación con Resend\n');
  
  const results = {
    configuration: false,
    connection: false,
    tokenGeneration: false,
    emailSending: false
  };
  
  // Ejecutar pruebas
  results.configuration = await testConfiguration();
  
  if (results.configuration) {
    results.connection = await testResendConnection();
    results.tokenGeneration = !!testTokenGeneration();
    
    if (results.connection) {
      results.emailSending = await testPasswordResetEmail();
    }
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  
  const summary = {
    '1. Configuración': results.configuration ? '✅ Exitoso' : '❌ Fallido',
    '2. Conexión Resend': results.connection ? '✅ Exitoso' : '❌ Fallido',
    '3. Generación Token': results.tokenGeneration ? '✅ Exitoso' : '❌ Fallido',
    '4. Envío Email': results.emailSending ? '✅ Exitoso' : '❌ Fallido'
  };
  
  console.table(summary);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('✅ El servicio Resend está funcionando correctamente');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. 🌐 Inicia el servidor: npm run dev');
    console.log('2. 🔗 Visita: http://localhost:3000/auth/forgot-password');
    console.log('3. 🧪 Prueba con una cédula válida');
    console.log('4. 📧 Verifica que el email llegue correctamente');
    console.log('\n🔗 ENDPOINTS IMPORTANTES:');
    console.log('• Password Reset: /api/send-password-email-resend');
    console.log('• Update Password: /api/update-password-direct');
    console.log('• Stats (dev): /api/send-password-email-resend (GET)');
  } else {
    console.log('\n❌ ALGUNAS PRUEBAS FALLARON');
    console.log('🔧 Revisa la configuración y los errores mostrados arriba');
    console.log('\n🆘 SOLUCIÓN DE PROBLEMAS:');
    console.log('1. Verifica que RESEND_API_KEY esté configurado');
    console.log('2. Confirma que la API key de Resend sea válida');
    console.log('3. Revisa la conexión a internet');
    console.log('4. Consulta los logs para más detalles');
  }
  
  console.log('\n📧 INFORMACIÓN DE RESEND:');
  console.log('• Dashboard: https://resend.com/emails');
  console.log('• Docs: https://resend.com/docs');
  console.log('• API Key: ' + RESEND_API_KEY.substring(0, 8) + '...');
  console.log('• Support Email: ' + SUPPORT_EMAIL);
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error('\n💥 Error ejecutando pruebas:', error);
  process.exit(1);
});