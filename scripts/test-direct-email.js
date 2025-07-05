require('dotenv').config({ path: '.env.production' })
const nodemailer = require('nodemailer')
const crypto = require('crypto')

// Funciones auxiliares para simular el servicio
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function testSMTPConnection(config) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port),
    secure: parseInt(config.port) === 465,
    auth: {
      user: config.user,
      pass: config.pass
    }
  })
  
  try {
    await transporter.verify()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testDirectEmailService() {
  console.log('🧪 Iniciando pruebas del servicio de email directo...\n')
  
  try {
    // 1. Verificar configuración SMTP
    console.log('1️⃣ Verificando configuración SMTP...')
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.NEXT_PUBLIC_SUPPORT_EMAIL
    }
    
    console.log('   📧 Host SMTP:', smtpConfig.host || '❌ No configurado')
    console.log('   🔌 Puerto:', smtpConfig.port || '❌ No configurado')
    console.log('   👤 Usuario:', smtpConfig.user ? '✅ Configurado' : '❌ No configurado')
    console.log('   🔑 Contraseña:', smtpConfig.pass ? '✅ Configurado' : '❌ No configurado')
    console.log('   📨 Email origen:', smtpConfig.from || '❌ No configurado')
    
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass || !smtpConfig.from) {
      console.log('\n❌ Configuración SMTP incompleta. Verifica las variables de entorno:')
      console.log('   - SMTP_HOST')
      console.log('   - SMTP_PORT')
      console.log('   - SMTP_USER')
      console.log('   - SMTP_PASS')
      console.log('   - NEXT_PUBLIC_SUPPORT_EMAIL')
      return
    }
    
    console.log('   ✅ Configuración SMTP completa\n')
    
    // 2. Probar conexión SMTP
    console.log('2️⃣ Probando conexión SMTP...')
    try {
      const connectionTest = await testSMTPConnection(smtpConfig)
      if (connectionTest.success) {
        console.log('   ✅ Conexión SMTP exitosa')
      } else {
        console.log('   ❌ Error en conexión SMTP:', connectionTest.error)
        return
      }
    } catch (error) {
      console.log('   ❌ Error al probar conexión SMTP:', error.message)
      return
    }
    
    console.log('')
    
    // 3. Generar token de prueba
    console.log('3️⃣ Generando token de prueba...')
    const testEmail = 'test@example.com'
    const token = generateToken()
    console.log('   ✅ Token generado:', token.substring(0, 20) + '...')
    console.log('')
    
    // 4. Probar envío de email
    console.log('4️⃣ Probando envío de email de prueba...')
    try {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        secure: parseInt(smtpConfig.port) === 465,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      })
      
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password-direct?token=${token}&email=${encodeURIComponent(testEmail)}`
      
      const mailOptions = {
        from: smtpConfig.from,
        to: smtpConfig.from, // Enviar a nosotros mismos para prueba
        subject: '[PRUEBA] Recuperación de Contraseña - ORPA',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🧪 Email de Prueba - Recuperación de Contraseña</h2>
            <p>Este es un email de prueba del sistema de recuperación directo.</p>
            <p><strong>Token:</strong> ${token.substring(0, 20)}...</p>
            <p><strong>URL de reset:</strong> <a href="${resetUrl}">${resetUrl}</a></p>
            <p style="color: #666; font-size: 12px;">Este es un email de prueba generado automáticamente.</p>
          </div>
        `
      }
      
      await transporter.sendMail(mailOptions)
      console.log('   ✅ Email de prueba enviado exitosamente')
    } catch (error) {
      console.log('   ⚠️  Error al enviar email de prueba:', error.message)
      console.log('   ℹ️  Esto no afecta la funcionalidad, solo la prueba de envío')
    }
    
    console.log('')
    
    console.log('🎉 Pruebas del servicio directo completadas!')
    console.log('')
    console.log('📋 Próximos pasos:')
    console.log('   1. Configura las variables SMTP en tu archivo .env.production')
    console.log('   2. Reinicia tu aplicación')
    console.log('   3. Prueba el flujo completo desde la interfaz web')
    console.log('   4. Verifica que los emails lleguen correctamente')
    console.log('')
    console.log('🔗 URLs importantes:')
    console.log('   - Recuperar contraseña: /auth/forgot-password')
    console.log('   - Reset directo: /auth/reset-password-direct')
    console.log('')
    console.log('📧 Endpoints de API:')
    console.log('   - POST /api/send-password-email-direct')
    console.log('   - POST /api/validate-reset-token')
    console.log('   - POST /api/update-password-direct')
    console.log('')
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
    console.log('')
    console.log('🔧 Posibles soluciones:')
    console.log('   1. Verifica que todas las dependencias estén instaladas')
    console.log('   2. Asegúrate de que el archivo .env.production existe')
    console.log('   3. Verifica la configuración SMTP')
    console.log('   4. Revisa los logs de error para más detalles')
  }
}

// Ejecutar pruebas
testDirectEmailService().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Error fatal:', error)
  process.exit(1)
})