/**
 * Script de verificación rápida para confirmar que la solución de URL de redirección funciona
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

function showHeader() {
  console.log('🔍 VERIFICACIÓN DE SOLUCIÓN - URL DE REDIRECCIÓN');
  console.log('=' .repeat(55));
  console.log();
}

function checkEnvironmentVariables() {
  console.log('📋 1. VERIFICANDO VARIABLES DE ENTORNO...');
  
  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: SUPABASE_URL, expected: 'https://smirsvavqrhqwzflhbwg.supabase.co' },
    { name: 'NEXT_PUBLIC_SITE_URL', value: SITE_URL, expected: 'https://micuenta.orpainversiones.com' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_KEY ? '✓ Configurada' : '✗ Faltante', expected: '✓ Configurada' }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    const status = check.value === check.expected ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.value}`);
    if (check.value !== check.expected) {
      allGood = false;
      console.log(`      Esperado: ${check.expected}`);
    }
  });
  
  console.log();
  return allGood;
}

function checkRedirectUrl() {
  console.log('🔗 2. VERIFICANDO URL DE REDIRECCIÓN...');
  
  const expectedUrl = `${SITE_URL}/auth/reset-password`;
  console.log(`  📍 URL de redirección: ${expectedUrl}`);
  
  if (SITE_URL === 'https://micuenta.orpainversiones.com') {
    console.log('  ✅ URL corregida correctamente');
    return true;
  } else {
    console.log('  ❌ URL incorrecta');
    console.log('      Debe ser: https://micuenta.orpainversiones.com');
    return false;
  }
}

async function testSupabaseConnection() {
  console.log('🔌 3. PROBANDO CONEXIÓN A SUPABASE...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Probar una consulta simple
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    
    if (error && !error.message.includes('relation "usuarios" does not exist')) {
      console.log('  ❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('  ✅ Conexión exitosa');
    return true;
  } catch (err) {
    console.log('  ❌ Error de conexión:', err.message);
    return false;
  }
}

async function testEmailReset() {
  console.log('📧 4. PROBANDO ENVÍO DE EMAIL DE RECUPERACIÓN...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const testEmail = 'test@orpainversiones.com'; // Email de prueba
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${SITE_URL}/auth/reset-password`,
    });
    
    if (error) {
      console.log('  ❌ Error al enviar email:', error.message);
      
      // Analizar el tipo de error
      if (error.message.includes('Invalid redirect URL')) {
        console.log('  🚨 PROBLEMA: URL de redirección no autorizada en Supabase');
        console.log('      Solución: Agregar la URL en Supabase Dashboard > Authentication > URL Configuration');
      } else if (error.message.includes('Email address not authorized')) {
        console.log('  ⚠️  ADVERTENCIA: Usando SMTP por defecto (limitado a miembros del equipo)');
        console.log('      Esto es normal si el email de prueba no es miembro del equipo');
      } else if (error.message.includes('rate limit')) {
        console.log('  ⚠️  ADVERTENCIA: Límite de rate alcanzado');
        console.log('      Esto es normal, indica que el sistema está funcionando');
      }
      
      return false;
    } else {
      console.log('  ✅ Email enviado exitosamente');
      return true;
    }
  } catch (err) {
    console.log('  ❌ Error inesperado:', err.message);
    return false;
  }
}

function showNextSteps(envOk, urlOk, connectionOk, emailOk) {
  console.log('📝 PRÓXIMOS PASOS:');
  console.log();
  
  if (!envOk) {
    console.log('❌ 1. Corregir variables de entorno en .env.production');
  } else {
    console.log('✅ 1. Variables de entorno correctas');
  }
  
  if (!urlOk) {
    console.log('❌ 2. Corregir NEXT_PUBLIC_SITE_URL');
  } else {
    console.log('✅ 2. URL de sitio correcta');
  }
  
  if (!connectionOk) {
    console.log('❌ 3. Verificar conexión a Supabase');
  } else {
    console.log('✅ 3. Conexión a Supabase exitosa');
  }
  
  console.log();
  console.log('🔧 ACCIONES REQUERIDAS EN SUPABASE DASHBOARD:');
  console.log('1. Ve a: https://supabase.com/dashboard/project/smirsvavqrhqwzflhbwg/auth/url-configuration');
  console.log('2. Agregar en "Redirect URLs":');
  console.log('   - https://micuenta.orpainversiones.com/**');
  console.log('   - https://micuenta.orpainversiones.com/auth/reset-password');
  console.log('3. Verificar SMTP personalizado en: Authentication > Settings > SMTP Settings');
  
  console.log();
  console.log('🔄 DESPUÉS DE LOS CAMBIOS:');
  console.log('1. Reiniciar la aplicación');
  console.log('2. Probar el flujo de recuperación de contraseña');
  console.log('3. Ejecutar: npm run verify-fix');
}

async function main() {
  showHeader();
  
  const envOk = checkEnvironmentVariables();
  const urlOk = checkRedirectUrl();
  const connectionOk = await testSupabaseConnection();
  const emailOk = await testEmailReset();
  
  console.log();
  console.log('📊 RESUMEN:');
  console.log(`Variables de entorno: ${envOk ? '✅' : '❌'}`);
  console.log(`URL de redirección: ${urlOk ? '✅' : '❌'}`);
  console.log(`Conexión Supabase: ${connectionOk ? '✅' : '❌'}`);
  console.log(`Envío de email: ${emailOk ? '✅' : '❌'}`);
  
  console.log();
  
  if (envOk && urlOk && connectionOk) {
    console.log('🎉 CONFIGURACIÓN BASE CORRECTA');
    console.log('Si el envío de email falló, probablemente necesitas configurar las URLs en Supabase Dashboard.');
  } else {
    console.log('⚠️  CONFIGURACIÓN INCOMPLETA');
    console.log('Revisa los elementos marcados con ❌ arriba.');
  }
  
  console.log();
  showNextSteps(envOk, urlOk, connectionOk, emailOk);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkEnvironmentVariables, checkRedirectUrl, testSupabaseConnection, testEmailReset };