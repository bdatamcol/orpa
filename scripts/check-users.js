/**
 * Script para verificar usuarios existentes en Supabase
 * Ayuda a identificar cédulas válidas para pruebas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Variables de entorno faltantes:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('🔍 Verificando usuarios en Supabase...');
  console.log('=' .repeat(50));
  
  try {
    // Primero verificar qué tablas existen
    console.log('📋 Verificando tablas disponibles...');
    
    // Intentar diferentes nombres de tabla comunes
    const tableNames = ['users', 'user', 'usuarios', 'usuario', 'profiles', 'auth.users'];
    
    for (const tableName of tableNames) {
      console.log(`\n🔍 Probando tabla: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error && data) {
        console.log(`✅ Tabla encontrada: ${tableName}`);
        console.log('Columnas disponibles:', Object.keys(data[0] || {}));
        
        // Si encontramos una tabla, intentar buscar usuarios
        const { data: users, error: usersError } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);
        
        if (!usersError && users) {
          console.log(`\n📊 Primeros ${users.length} registros:`);
          console.table(users);
          return;
        }
      } else {
        console.log(`❌ ${tableName}: ${error?.message || 'No encontrada'}`);
      }
    }
    
    console.log('\n⚠️  No se encontraron tablas de usuarios');
    
    // Consultar usuarios (código original como fallback)
    const { data: users, error } = await supabase
      .from('users')
      .select('cedula, email')
      .limit(10);
    
    if (error) {
      console.log('❌ Error consultando usuarios:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️  No se encontraron usuarios en la tabla');
      console.log('\n💡 Posibles causas:');
      console.log('1. La tabla "users" está vacía');
      console.log('2. El nombre de la tabla es diferente');
      console.log('3. Problemas de permisos');
      return;
    }
    
    console.log(`✅ Encontrados ${users.length} usuarios:`);
    console.log('\n📋 Lista de usuarios:');
    console.table(users.map(user => ({
      'Cédula': user.cedula,
      'Email': user.email ? user.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'Sin email'
    })));
    
    console.log('\n🧪 Para pruebas, usa una de estas cédulas:');
    users.forEach((user, index) => {
      if (user.email) {
        console.log(`${index + 1}. Cédula: ${user.cedula}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

checkUsers();