/**
 * Script de diagnóstico SMTP para ORPA
 * Ayuda a identificar y resolver problemas de configuración de email
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno faltantes');
  console.log('Asegúrate de tener configuradas:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testEmailSending() {
  console.log('\n🔍 Diagnóstico SMTP para ORPA\n');
  
  const email = await askQuestion('Ingresa el email para probar: ');
  
  if (!email || !email.includes('@')) {
    console.log('❌ Email inválido');
    return;
  }
  
  console.log('\n📧 Intentando enviar email de recuperación...');
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password'
    });
    
    if (error) {
      console.log('❌ Error al enviar email:');
      console.log(`   Mensaje: ${error.message}`);
      console.log(`   Código: ${error.status || 'N/A'}`);
      
      // Diagnóstico específico
      if (error.message.includes('Email address not authorized') || 
          error.message.includes('not authorized')) {
        console.log('\n🔧 Diagnóstico:');
        console.log('   - El email no está autorizado en Supabase');
        console.log('   - Solución: Agregar el email como miembro del equipo');
        console.log('   - O configurar SMTP personalizado');
      } else if (error.message.includes('rate limit') || 
                 error.message.includes('too many requests')) {
        console.log('\n🔧 Diagnóstico:');
        console.log('   - Límite de rate excedido (2-3 emails/hora)');
        console.log('   - Solución: Esperar 1 hora o configurar SMTP personalizado');
      } else {
        console.log('\n🔧 Diagnóstico:');
        console.log('   - Error genérico del SMTP por defecto');
        console.log('   - Solución recomendada: Configurar SMTP personalizado');
      }
      
    } else {
      console.log('✅ Email enviado exitosamente!');
      console.log('   Revisa la bandeja de entrada (y spam)');
    }
    
  } catch (err) {
    console.log('❌ Error inesperado:', err.message);
  }
}

async function checkConfiguration() {
  console.log('\n⚙️  Verificando configuración...\n');
  
  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`   SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Faltante'}`);
  
  // Verificar conexión a Supabase
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log(`   Conexión Supabase: ${error ? '❌ Error' : '✅ OK'}`);
  } catch (err) {
    console.log('   Conexión Supabase: ❌ Error de conexión');
  }
  
  console.log('\n📧 Configuración SMTP:');
  console.log('   Estado: Usando SMTP por defecto de Supabase');
  console.log('   Limitaciones:');
  console.log('   - Solo emails autorizados (miembros del equipo)');
  console.log('   - Límite: 2-3 emails por hora');
  console.log('   - Sin garantía de entrega');
  
  console.log('\n💡 Recomendaciones:');
  console.log('   1. Para desarrollo: Agregar emails como miembros del equipo');
  console.log('   2. Para producción: Configurar SMTP personalizado');
  console.log('   3. Ver: docs/smtp-configuration-guide.md');
}

async function showSMTPGuide() {
  console.log('\n📖 Guía Rápida de Configuración SMTP\n');
  
  console.log('🔧 Opción 1: Gmail SMTP (Desarrollo)');
  console.log('   Host: smtp.gmail.com');
  console.log('   Puerto: 587');
  console.log('   Usuario: tu-email@gmail.com');
  console.log('   Contraseña: [App Password de Google]');
  
  console.log('\n🔧 Opción 2: Resend (Producción)');
  console.log('   Host: smtp.resend.com');
  console.log('   Puerto: 587');
  console.log('   Usuario: resend');
  console.log('   Contraseña: [API Key de Resend]');
  
  console.log('\n📋 Pasos para configurar:');
  console.log('   1. Ve al dashboard de Supabase');
  console.log('   2. Authentication → Settings');
  console.log('   3. Habilita "Custom SMTP"');
  console.log('   4. Completa los datos del proveedor');
  console.log('   5. Guarda y prueba');
  
  console.log('\n📚 Documentación completa:');
  console.log('   - docs/smtp-configuration-guide.md');
  console.log('   - https://supabase.com/docs/guides/auth/auth-smtp');
}

async function main() {
  console.log('🚀 Script de Diagnóstico SMTP - ORPA');
  console.log('=====================================\n');
  
  while (true) {
    console.log('Opciones disponibles:');
    console.log('1. Probar envío de email');
    console.log('2. Verificar configuración');
    console.log('3. Mostrar guía SMTP');
    console.log('4. Salir');
    
    const option = await askQuestion('\nSelecciona una opción (1-4): ');
    
    switch (option) {
      case '1':
        await testEmailSending();
        break;
      case '2':
        await checkConfiguration();
        break;
      case '3':
        await showSMTPGuide();
        break;
      case '4':
        console.log('\n👋 ¡Hasta luego!');
        rl.close();
        return;
      default:
        console.log('\n❌ Opción inválida');
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Error no manejado:', error.message);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Script interrumpido por el usuario');
  rl.close();
  process.exit(0);
});

// Ejecutar script principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testEmailSending,
  checkConfiguration,
  showSMTPGuide
};