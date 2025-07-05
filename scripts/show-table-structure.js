/**
 * Script para mostrar la estructura exacta de las tablas de usuarios
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

async function showTableStructure() {
  console.log('🔍 Analizando estructura de tablas de usuarios...');
  console.log('=' .repeat(60));
  
  const tableNames = ['users', 'user', 'usuarios', 'usuario', 'profiles'];
  
  for (const tableName of tableNames) {
    console.log(`\n📋 Tabla: ${tableName}`);
    console.log('-' .repeat(30));
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️  Tabla vacía');
        continue;
      }
      
      console.log('✅ Tabla encontrada');
      console.log('📊 Columnas disponibles:');
      
      const columns = Object.keys(data[0]);
      columns.forEach((col, index) => {
        const value = data[0][col];
        const type = typeof value;
        console.log(`   ${index + 1}. ${col} (${type}): ${value}`);
      });
      
      // Buscar columnas que podrían contener email
      const emailColumns = columns.filter(col => 
        col.toLowerCase().includes('email') || 
        col.toLowerCase().includes('correo') || 
        col.toLowerCase().includes('mail')
      );
      
      if (emailColumns.length > 0) {
        console.log('📧 Columnas de email encontradas:', emailColumns);
      } else {
        console.log('⚠️  No se encontraron columnas de email obvias');
      }
      
      // Buscar columnas que podrían contener cédula
      const cedulaColumns = columns.filter(col => 
        col.toLowerCase().includes('cedula') || 
        col.toLowerCase().includes('documento') || 
        col.toLowerCase().includes('id') ||
        col.toLowerCase().includes('dni')
      );
      
      if (cedulaColumns.length > 0) {
        console.log('🆔 Columnas de cédula encontradas:', cedulaColumns);
      }
      
      // Mostrar algunos registros más para entender mejor
      console.log('\n📋 Primeros 3 registros:');
      const { data: moreData } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (moreData && moreData.length > 0) {
        moreData.forEach((record, index) => {
          console.log(`\n   Registro ${index + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
          });
        });
      }
      
    } catch (e) {
      console.log(`❌ Error inesperado: ${e.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Análisis completado');
}

showTableStructure();