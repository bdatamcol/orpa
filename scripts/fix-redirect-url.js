/**
 * Script para diagnosticar y corregir problemas de URL de redirección en Supabase
 * Este script ayuda a identificar discrepancias entre las URLs configuradas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SITE_URL) {
  console.error('❌ Variables de entorno faltantes:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY);
  console.error('NEXT_PUBLIC_SITE_URL:', !!SITE_URL);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkRedirectUrls() {
  console.log('🔍 Verificando configuración de URLs de redirección...');
  console.log('📍 URL del sitio configurada:', SITE_URL);
  
  const expectedResetUrl = `${SITE_URL}/auth/reset-password`;
  console.log('📍 URL de reset esperada:', expectedResetUrl);
  
  console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
  console.log('En los logs se observa que se está intentando redirigir a:');
  console.log('https://micuenta.orpainversiones.com/auth/reset-password');
  console.log('\nPero la URL configurada en .env.production es:');
  console.log(SITE_URL);
  
  console.log('\n🔧 SOLUCIONES POSIBLES:');
  console.log('\n1. OPCIÓN A: Actualizar .env.production para que coincida con el dominio real');
  console.log('   Cambiar NEXT_PUBLIC_SITE_URL a: https://micuenta.orpainversiones.com');
  
  console.log('\n2. OPCIÓN B: Verificar URLs autorizadas en Supabase Dashboard');
  console.log('   - Ve a: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('//')[1].split('.')[0]);
  console.log('   - Navega a: Authentication > URL Configuration');
  console.log('   - Asegúrate de que estas URLs estén en la lista:');
  console.log('     * https://micuenta.orpainversiones.com/**');
  console.log('     * https://micuentacorporaversiones.com/**');
  
  console.log('\n3. OPCIÓN C: Verificar configuración SMTP personalizada');
  console.log('   - Ve a: Authentication > Settings > SMTP Settings');
  console.log('   - Verifica que el SMTP personalizado esté habilitado');
  console.log('   - Confirma las credenciales SMTP proporcionadas');
}

async function testEmailSending() {
  console.log('\n📧 Probando envío de email de recuperación...');
  
  // Email de prueba (debe ser un email real para testing)
  const testEmail = 'test@orpainversiones.com';
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${SITE_URL}/auth/reset-password`,
    });
    
    if (error) {
      console.error('❌ Error al enviar email:', error.message);
      
      if (error.message.includes('Invalid redirect URL')) {
        console.log('\n🚨 PROBLEMA CONFIRMADO: URL de redirección no autorizada');
        console.log('La URL', `${SITE_URL}/auth/reset-password`, 'no está en la lista de URLs autorizadas');
      }
      
      if (error.message.includes('Email address not authorized')) {
        console.log('\n🚨 PROBLEMA: Email no autorizado (SMTP por defecto)');
        console.log('Esto confirma que NO se está usando el SMTP personalizado');
      }
      
      return false;
    } else {
      console.log('✅ Email enviado exitosamente');
      return true;
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    return false;
  }
}

async function showSupabaseConfig() {
  console.log('\n📋 CONFIGURACIÓN ACTUAL:');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Site URL:', SITE_URL);
  console.log('Reset URL:', `${SITE_URL}/auth/reset-password`);
  
  console.log('\n🔗 ENLACES ÚTILES:');
  const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];
  console.log('Dashboard:', `https://supabase.com/dashboard/project/${projectRef}`);
  console.log('Auth Settings:', `https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`);
  console.log('SMTP Settings:', `https://supabase.com/dashboard/project/${projectRef}/auth/settings`);
}

async function main() {
  console.log('🔧 DIAGNÓSTICO DE URL DE REDIRECCIÓN - SUPABASE\n');
  
  await checkRedirectUrls();
  await showSupabaseConfig();
  
  console.log('\n' + '='.repeat(60));
  console.log('📝 PASOS RECOMENDADOS:');
  console.log('1. Verificar y corregir NEXT_PUBLIC_SITE_URL en .env.production');
  console.log('2. Agregar todas las URLs necesarias en Supabase Dashboard');
  console.log('3. Confirmar que el SMTP personalizado esté activo');
  console.log('4. Reiniciar la aplicación después de los cambios');
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkRedirectUrls, testEmailSending, showSupabaseConfig };