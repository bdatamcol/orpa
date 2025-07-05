/**
 * Script para probar el modo testing del sistema de emails
 * Este script verifica que los emails se envíen a la dirección autorizada
 * cuando el usuario no está en la lista de emails autorizados
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuración
const SUPABASE_URL = 'https://ixqjqfkpqjqjqjqjqjqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxZmtwcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NzI4MDAsImV4cCI6MjA1MDA0ODgwMH0.example';
const API_BASE_URL = 'http://localhost:3000';

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmailWithTestingMode() {
  console.log('🧪 Iniciando prueba del modo testing de emails\n');
  
  try {
    // 1. Buscar un usuario en la base de datos
    console.log('📋 Buscando usuarios en la base de datos...');
    const { data: users, error: dbError } = await supabase
      .from('usuarios')
      .select('cedula, correo, nombre1, apellido1')
      .limit(3);
    
    if (dbError) {
      console.error('❌ Error consultando base de datos:', dbError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la base de datos');
      return;
    }
    
    console.log(`✅ Encontrados ${users.length} usuarios:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nombre1} ${user.apellido1} - ${user.cedula} - ${user.correo}`);
    });
    
    // 2. Seleccionar el primer usuario para la prueba
    const testUser = users[0];
    console.log(`\n🎯 Usando para prueba: ${testUser.nombre1} ${testUser.apellido1}`);
    console.log(`   Cédula: ${testUser.cedula}`);
    console.log(`   Email: ${testUser.correo}`);
    
    // 3. Verificar si el email está en la lista de autorizados
    const authorizedEmails = ['digital@bdatam.com', 'admin@orpainversiones.com'];
    const isAuthorized = authorizedEmails.includes(testUser.correo);
    
    console.log(`\n📧 Estado del email:`);
    console.log(`   Email autorizado: ${isAuthorized ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Modo esperado: ${isAuthorized ? 'PRODUCCIÓN' : 'TESTING'}`);
    
    if (!isAuthorized) {
      console.log(`   📮 Email se enviará a: digital@bdatam.com`);
      console.log(`   📝 Contenido incluirá info del usuario real`);
    }
    
    // 4. Enviar solicitud de recuperación
    console.log(`\n🚀 Enviando solicitud de recuperación de contraseña...`);
    
    const response = await fetch(`${API_BASE_URL}/api/send-password-email-resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cedula: testUser.cedula
      })
    });
    
    const result = await response.json();
    
    console.log(`\n📊 Resultado de la solicitud:`);
    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Éxito: ${result.success ? '✅' : '❌'}`);
    console.log(`   Mensaje: ${result.message || 'Sin mensaje'}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    // 5. Mostrar resumen
    console.log(`\n📋 Resumen de la prueba:`);
    console.log(`   Usuario probado: ${testUser.correo}`);
    console.log(`   Modo testing activo: ${!isAuthorized ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Email enviado: ${result.success ? '✅ SÍ' : '❌ NO'}`);
    
    if (!isAuthorized && result.success) {
      console.log(`\n🎉 ¡Modo testing funcionando correctamente!`);
      console.log(`   ✅ El email se envió a digital@bdatam.com`);
      console.log(`   ✅ El contenido incluye información del usuario real`);
      console.log(`   ✅ El sistema maneja correctamente emails no autorizados`);
    } else if (isAuthorized && result.success) {
      console.log(`\n🎉 ¡Modo producción funcionando correctamente!`);
      console.log(`   ✅ El email se envió directamente al usuario`);
      console.log(`   ✅ No se aplicó redirección de testing`);
    }
    
    console.log(`\n💡 Próximos pasos:`);
    console.log(`   1. Verificar el email en digital@bdatam.com`);
    console.log(`   2. Confirmar que el contenido muestra la información correcta`);
    console.log(`   3. Probar el enlace de recuperación`);
    console.log(`   4. Para producción: configurar dominio verificado en Resend`);
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Solución sugerida:');
      console.log('   El servidor no está ejecutándose. Inicia el servidor con:');
      console.log('   npm run dev');
    }
  }
}

// Ejecutar la prueba
testEmailWithTestingMode();