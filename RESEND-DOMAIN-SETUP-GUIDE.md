# 🌐 Guía de Configuración de Dominio en Resend

## 🚨 Problema Actual

**Error identificado**:
```
You can only send testing emails to your own email address (digital@bdatam.com). 
To send emails to other recipients, please verify a domain at resend.com/domains, 
and change the `from` address to an email using this domain.
```

## 📋 Estado Actual del Sistema

### ✅ Lo que funciona:
- ✅ Conexión con Resend establecida
- ✅ API Key válida: `re_TzHs3o7J_BHRQZAduxQfpJgniyPW2noXV`
- ✅ Base de datos corregida (tabla `usuarios`, columna `correo`)
- ✅ Usuarios encontrados correctamente
- ✅ Templates de email configurados

### ⚠️ Limitación actual:
- **Solo puede enviar a**: `digital@bdatam.com` (email del propietario)
- **No puede enviar a**: Otros emails de usuarios reales

## 🛠️ Soluciones Disponibles

### Opción 1: Verificar Dominio Propio (Recomendado para Producción)

#### Paso 1: Acceder a Resend Dashboard
1. Ir a: https://resend.com/domains
2. Hacer clic en "Add Domain"
3. Ingresar: `orpainversiones.com`

#### Paso 2: Configurar DNS
Resend proporcionará registros DNS que debes agregar:
```
Tipo: TXT
Nombre: _resend
Valor: [valor proporcionado por Resend]
```

#### Paso 3: Actualizar Código
```javascript
// En resendEmailService.ts
const result = await this.resend.emails.send({
  from: 'ORPA <noreply@orpainversiones.com>', // ✅ Dominio verificado
  to: [email],
  subject: template.subject,
  html: template.html,
  text: template.text
});
```

### Opción 2: Usar Subdominio (Más Rápido)

#### Configurar subdominio para emails:
```
// Ejemplo: emails.orpainversiones.com
from: 'ORPA <noreply@emails.orpainversiones.com>'
```

### Opción 3: Solución Temporal para Testing

#### Modificar para enviar solo a emails autorizados:
```javascript
// Crear lista de emails autorizados para testing
const AUTHORIZED_TEST_EMAILS = [
  'digital@bdatam.com',
  'admin@orpainversiones.com',
  // Agregar otros emails del equipo
];

// En el servicio de email
if (!AUTHORIZED_TEST_EMAILS.includes(email)) {
  // Enviar a email autorizado pero con información del usuario real
  const testEmail = 'digital@bdatam.com';
  const modifiedTemplate = this.createTestTemplate(resetUrl, cedula, email);
  
  await this.resend.emails.send({
    from: 'ORPA <onboarding@resend.dev>',
    to: [testEmail],
    subject: `[TEST] Recuperación para ${email}`,
    html: modifiedTemplate.html
  });
}
```

## 🚀 Implementación Inmediata

### Solución Temporal Implementable Ahora

Crear un modo de testing que permita probar el flujo completo:

```javascript
// config/email.ts
export const EMAIL_CONFIG = {
  TESTING_MODE: process.env.NODE_ENV !== 'production',
  AUTHORIZED_EMAILS: [
    'digital@bdatam.com',
    'admin@orpainversiones.com'
  ],
  FALLBACK_EMAIL: 'digital@bdatam.com'
};

// En resendEmailService.ts
async sendPasswordResetEmail(email: string, cedula: string, ip?: string) {
  let targetEmail = email;
  let isTestMode = false;
  
  // Si no es un email autorizado, usar modo test
  if (!EMAIL_CONFIG.AUTHORIZED_EMAILS.includes(email)) {
    targetEmail = EMAIL_CONFIG.FALLBACK_EMAIL;
    isTestMode = true;
  }
  
  const template = isTestMode 
    ? this.createTestTemplate(resetUrl, cedula, email) // Email original en el contenido
    : this.createPasswordResetTemplate(resetUrl, cedula);
  
  const result = await this.resend.emails.send({
    from: 'ORPA <onboarding@resend.dev>',
    to: [targetEmail],
    subject: isTestMode ? `[TEST] ${template.subject} - Para: ${email}` : template.subject,
    html: template.html,
    text: template.text
  });
}
```

## 📊 Plan de Acción Recomendado

### Fase 1: Solución Inmediata (Hoy)
1. ✅ Implementar modo testing con email autorizado
2. ✅ Modificar templates para mostrar email real en contenido
3. ✅ Probar flujo completo con usuarios reales

### Fase 2: Configuración de Dominio (1-3 días)
1. 🔄 Verificar dominio `orpainversiones.com` en Resend
2. 🔄 Configurar registros DNS
3. 🔄 Actualizar código para usar dominio verificado

### Fase 3: Producción (Después de verificación)
1. 🔄 Cambiar a dominio propio
2. 🔄 Remover modo testing
3. 🔄 Monitorear entregas

## 🔧 Comandos Útiles

```bash
# Probar con email autorizado
node scripts/debug-email-flow.js 37395134

# Verificar configuración actual
node scripts/test-resend-email.js

# Monitorear logs del servidor
npm run dev
```

## 📧 Información de Contacto

### Resend Dashboard
- **Domains**: https://resend.com/domains
- **Emails**: https://resend.com/emails
- **API Keys**: https://resend.com/api-keys

### Documentación
- **Domain Setup**: https://resend.com/docs/dashboard/domains/introduction
- **DNS Configuration**: https://resend.com/docs/dashboard/domains/dns-records

## 🎯 Próximos Pasos

1. **Inmediato**: Implementar modo testing para continuar desarrollo
2. **Corto plazo**: Verificar dominio para envío real
3. **Largo plazo**: Configurar webhooks y métricas avanzadas

---

*Guía actualizada: ${new Date().toISOString()}*
*Estado: 🔄 CONFIGURACIÓN DE DOMINIO PENDIENTE*