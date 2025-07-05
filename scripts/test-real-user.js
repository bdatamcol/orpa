/**
 * Script para probar el envío de email con un usuario real
 * Usa cédulas válidas de la base de datos
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const BASE_URL = 'http://localhost:3000';
const VALID_CEDULAS = [
  '1090453784', // Usuario encontrado en la base de datos
  '1090178379'  // Otro usuario válido
];

console.log('🧪 Probando envío de email con usuarios reales...');
console.log('=' .repeat(60));

async function testRealUser(cedula) {
  console.log(`\n🔍 Probando con cédula: ${cedula}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/send-password-email-resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      },
      body: JSON.stringify({ cedula })
    });
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📧 Response:`, result);
    
    if (response.ok && result.success) {
      console.log('✅ Email enviado exitosamente');
      if (result.expiresAt) {
        console.log(`⏰ Expira: ${new Date(result.expiresAt).toLocaleString()}`);
      }
      if (result.service) {
        console.log(`🚀 Servicio: ${result.service}`);
      }
      return true;
    } else {
      console.log('❌ Error en el envío:', result.error || result.message);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🎯 Probando con usuarios reales de la base de datos\n');
  
  let successCount = 0;
  
  for (const cedula of VALID_CEDULAS) {
    const success = await testRealUser(cedula);
    if (success) successCount++;
    
    // Esperar un poco entre pruebas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  
  console.log(`✅ Exitosas: ${successCount}/${VALID_CEDULAS.length}`);
  console.log(`❌ Fallidas: ${VALID_CEDULAS.length - successCount}/${VALID_CEDULAS.length}`);
  
  if (successCount === VALID_CEDULAS.length) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
    console.log('✅ El sistema de envío de emails está funcionando correctamente');
    console.log('\n📧 Verifica en el dashboard de Resend:');
    console.log('🔗 https://resend.com/emails');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron');
    console.log('🔧 Revisa los logs del servidor para más detalles');
  }
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. 🌐 Verifica en el dashboard de Resend');
  console.log('2. 📧 Confirma que los emails llegaron');
  console.log('3. 🔗 Prueba los enlaces de recuperación');
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`);
    if (response.ok) {
      console.log('✅ Servidor corriendo en', BASE_URL);
      return true;
    }
  } catch (error) {
    console.log('❌ Servidor no disponible:', error.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo: npm run dev');
    return false;
  }
}

// Ejecutar pruebas
checkServer().then(serverOk => {
  if (serverOk) {
    runTests();
  } else {
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});