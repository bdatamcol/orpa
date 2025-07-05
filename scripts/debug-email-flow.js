/**
 * Script para debuggear el flujo completo de envío de emails
 * Verifica cada paso del proceso de recuperación de contraseña
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugEmailFlow() {
  console.log('🔍 Debuggeando flujo de envío de emails...');
  console.log('=' .repeat(60));

  // Paso 1: Verificar usuarios en la base de datos
  console.log('\n📋 Paso 1: Verificando usuarios en la base de datos');
  
  // Detectar tabla correcta
  let correctTable = null;
  const tableNames = ['users', 'user', 'usuarios', 'usuario', 'profiles'];
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error && data) {
        correctTable = tableName;
        console.log(`✅ Tabla encontrada: ${tableName}`);
        break;
      }
    } catch (e) {
      // Continuar con la siguiente tabla
    }
  }
  
  if (!correctTable) {
    console.error('❌ No se encontró ninguna tabla de usuarios válida');
    return;
  }
  
  try {
    const { data: users, error } = await supabase
      .from(correctTable)
      .select('cedula, correo')
      .limit(5);

    if (error) {
      console.error('❌ Error al consultar usuarios:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la tabla "usuario"');
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuarios:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. Cédula: ${user.cedula} - Email: ${user.correo}`);
    });

    // Paso 2: Probar con el primer usuario
    const testUser = users[0];
    console.log(`\n🧪 Paso 2: Probando con usuario: ${testUser.cedula}`);

    // Simular la búsqueda que hace la API
    const { data: foundUser, error: searchError } = await supabase
      .from(correctTable)
      .select('correo, cedula')
      .eq('cedula', testUser.cedula)
      .single();

    if (searchError || !foundUser) {
      console.log('❌ Usuario no encontrado en la búsqueda (esto causaría el problema)');
      console.log('   Error:', searchError?.message || 'Usuario no existe');
      return;
    }

    console.log('✅ Usuario encontrado correctamente:');
    console.log(`   Cédula: ${foundUser.cedula}`);
    console.log(`   Email: ${foundUser.correo}`);

    // Paso 3: Probar la API de envío
    console.log('\n📧 Paso 3: Probando API de envío de email');
    
    try {
      const response = await fetch('http://localhost:3000/api/send-password-email-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula: testUser.cedula })
      });

      const result = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, result);

      if (result.success) {
        console.log('✅ API reporta envío exitoso');
        console.log('   💡 Verifica el dashboard de Resend: https://resend.com/emails');
      } else {
        console.log('❌ API reporta error:', result.error || result.message);
      }

    } catch (fetchError) {
      console.log('❌ Error al conectar con la API:', fetchError.message);
      console.log('   💡 Asegúrate de que el servidor esté corriendo: npm run dev');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Debug completado');
}

// Función para probar con una cédula específica
async function testSpecificCedula(cedula) {
  console.log(`\n🎯 Probando cédula específica: ${cedula}`);
  console.log('-' .repeat(40));

  // Detectar tabla correcta
  let correctTable = null;
  const tableNames = ['users', 'user', 'usuarios', 'usuario', 'profiles'];
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error && data) {
        correctTable = tableName;
        break;
      }
    } catch (e) {
      // Continuar con la siguiente tabla
    }
  }
  
  if (!correctTable) {
    console.log('❌ No se encontró tabla de usuarios válida');
    return false;
  }
  
  try {
    const { data: user, error } = await supabase
      .from(correctTable)
      .select('correo, cedula')
      .eq('cedula', cedula)
      .single();

    if (error || !user) {
      console.log('❌ Usuario NO encontrado');
      console.log('   Esto explica por qué no se envía el email');
      console.log('   La API devuelve éxito por seguridad, pero no envía nada');
      return false;
    }

    console.log('✅ Usuario SÍ encontrado:');
    console.log(`   Email: ${user.correo}`);
    
    // Probar API
    console.log('\n🚀 Enviando solicitud de recuperación de contraseña...');
    console.log('📧 Modo testing activo: emails no autorizados se envían a digital@bdatam.com');
    console.log('📝 El contenido incluirá información del usuario real en modo testing');
    console.log('✅ Emails autorizados: digital@bdatam.com, admin@orpainversiones.com\n');
    try {
      const response = await fetch('http://localhost:3000/api/send-password-email-resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula })
      });

      const result = await response.json();
      console.log(`   API Status: ${response.status}`);
      console.log(`   API Response:`, result);
      
      return result.success;
    } catch (fetchError) {
      console.log('❌ Error de conexión:', fetchError.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Ejecutar según argumentos
const args = process.argv.slice(2);

if (args.length > 0) {
  // Probar cédula específica
  testSpecificCedula(args[0]);
} else {
  // Debug completo
  debugEmailFlow();
}

// Instrucciones de uso
if (args.length === 0) {
  console.log('\n💡 Uso:');
  console.log('   node scripts/debug-email-flow.js              # Debug completo');
  console.log('   node scripts/debug-email-flow.js 1090453784   # Probar cédula específica');
}