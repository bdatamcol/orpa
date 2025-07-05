# Guía de Implementación del Sistema de Email Directo

## 📋 Resumen

Este documento describe la implementación de un sistema alternativo de recuperación de contraseñas que **bypassa completamente Supabase Auth** y envía emails directamente usando SMTP. Esta solución fue creada para resolver el error persistente "Error sending recovery email" que ocurría con el sistema de Supabase.

## 🚀 Características

- ✅ **Envío directo de emails** usando Nodemailer
- ✅ **Tokens seguros** generados con crypto
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Validación robusta** de tokens y emails
- ✅ **Limpieza automática** de tokens expirados
- ✅ **Interfaz moderna** con React/Next.js
- ✅ **Manejo de errores** detallado
- ✅ **Logging de seguridad**

## 📁 Archivos Creados

### Servicios Backend
```
lib/services/directEmailService.ts     # Servicio principal de email directo
```

### API Endpoints
```
app/api/send-password-email-direct/route.ts    # Envío de emails de recuperación
app/api/validate-reset-token/route.ts          # Validación de tokens
app/api/update-password-direct/route.ts        # Actualización de contraseñas
```

### Páginas Frontend
```
app/auth/reset-password-direct/page.tsx        # Página de reset de contraseña
app/auth/forgot-password/page.tsx              # Modificada para usar endpoint directo
```

### Scripts de Utilidad
```
scripts/test-direct-email.js                   # Script de pruebas
```

### Documentación
```
DIRECT-EMAIL-GUIDE.md                          # Esta guía
```

## ⚙️ Configuración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env.production`:

```env
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion

# Email de soporte (ya configurado)
NEXT_PUBLIC_SUPPORT_EMAIL=soporte@orpainversiones.com

# URL del sitio (ya configurado)
NEXT_PUBLIC_SITE_URL=https://micuenta.orpainversiones.com
```

### 2. Proveedores SMTP Recomendados

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=contraseña-de-aplicacion  # No tu contraseña normal
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

### 3. Configuración de Gmail (Recomendado)

1. **Habilitar 2FA** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a Configuración de Google → Seguridad
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `SMTP_PASS`

## 🔧 Instalación

### 1. Dependencias

Las siguientes dependencias ya están instaladas:

```bash
npm install nodemailer @types/nodemailer bcryptjs @types/bcryptjs dotenv
```

### 2. Scripts NPM

Nuevos scripts disponibles en `package.json`:

```json
{
  "scripts": {
    "test-direct-email": "node scripts/test-direct-email.js"
  }
}
```

## 🧪 Pruebas

### Script de Pruebas

```bash
npm run test-direct-email
```

Este script verifica:
- ✅ Configuración SMTP
- ✅ Conexión al servidor SMTP
- ✅ Generación de tokens
- ✅ Envío de email de prueba

### Prueba Manual

1. **Ir a la página de recuperación**:
   ```
   http://localhost:3000/auth/forgot-password
   ```

2. **Ingresar una cédula válida**

3. **Verificar que el email llegue**

4. **Hacer clic en el enlace del email**

5. **Establecer nueva contraseña**

## 🔄 Flujo de Funcionamiento

### 1. Solicitud de Recuperación
```
Usuario → /auth/forgot-password → POST /api/send-password-email-direct
```

1. Usuario ingresa cédula
2. Sistema busca usuario en base de datos
3. Genera token seguro
4. Envía email con enlace de reset
5. Almacena token temporalmente

### 2. Validación de Token
```
Usuario → /auth/reset-password-direct → POST /api/validate-reset-token
```

1. Usuario hace clic en enlace del email
2. Sistema valida token y email
3. Muestra formulario de nueva contraseña

### 3. Actualización de Contraseña
```
Usuario → Nueva contraseña → POST /api/update-password-direct
```

1. Usuario ingresa nueva contraseña
2. Sistema valida token nuevamente
3. Hashea nueva contraseña
4. Actualiza en base de datos
5. Consume token (invalidación)
6. Redirige al login

## 🔒 Seguridad

### Tokens
- **Generación**: `crypto.randomBytes(32).toString('hex')`
- **Expiración**: 1 hora por defecto
- **Uso único**: Se consumen después del uso
- **Limpieza**: Tokens expirados se eliminan automáticamente

### Rate Limiting
- **Límite**: 3 intentos por IP por hora
- **Protección**: Previene ataques de fuerza bruta
- **Reset**: Límite se resetea cada hora

### Validaciones
- **Email**: Formato válido
- **Contraseña**: Mínimo 6 caracteres
- **Token**: Validación criptográfica
- **Usuario**: Existencia en base de datos

## 📧 Template de Email

El sistema incluye un template HTML responsivo con:

- 🎨 **Diseño moderno** y profesional
- 📱 **Responsive** para móviles
- 🔗 **Botón de acción** prominente
- ⏰ **Información de expiración**
- 🛡️ **Advertencias de seguridad**

## 🚨 Troubleshooting

### Error: "SMTP connection failed"

**Soluciones**:
1. Verifica credenciales SMTP
2. Habilita "Aplicaciones menos seguras" (Gmail)
3. Usa contraseña de aplicación (Gmail)
4. Verifica firewall/antivirus

### Error: "Token invalid or expired"

**Causas**:
1. Token expirado (>1 hora)
2. Token ya usado
3. Email incorrecto
4. Token malformado

### Error: "Rate limit exceeded"

**Solución**:
1. Esperar 1 hora
2. Usar IP diferente
3. Contactar administrador

### Error: "User not found"

**Verificar**:
1. Cédula correcta
2. Usuario existe en base de datos
3. Campo email poblado

## 🔄 Migración desde Supabase Auth

### Cambios Realizados

1. **Endpoint modificado**:
   ```diff
   - /api/send-password-email
   + /api/send-password-email-direct
   ```

2. **Nueva página de reset**:
   ```diff
   - /auth/reset-password (Supabase)
   + /auth/reset-password-direct (Directo)
   ```

3. **Flujo independiente**:
   - No depende de Supabase Auth
   - Manejo directo de tokens
   - SMTP personalizable

### Compatibilidad

- ✅ **Base de datos**: Usa misma tabla `usuarios`
- ✅ **Autenticación**: Compatible con sistema existente
- ✅ **UI/UX**: Mantiene diseño consistente
- ✅ **Seguridad**: Nivel igual o superior

## 📊 Monitoreo

### Logs de Seguridad

El sistema registra:
- ✅ Intentos de recuperación
- ✅ Tokens generados/validados/consumidos
- ✅ Actualizaciones de contraseña
- ✅ Errores de autenticación
- ✅ Rate limiting activado

### Métricas Recomendadas

- 📈 **Emails enviados** por día
- 📈 **Tokens validados** vs generados
- 📈 **Contraseñas actualizadas** exitosamente
- 📈 **Errores SMTP** por proveedor
- 📈 **Rate limiting** activaciones

## 🎯 Próximos Pasos

### Inmediatos
1. ✅ Configurar variables SMTP
2. ✅ Ejecutar `npm run test-direct-email`
3. ✅ Probar flujo completo
4. ✅ Verificar recepción de emails

### Opcionales
1. 🔄 **Configurar SendGrid** para mayor confiabilidad
2. 📊 **Implementar métricas** de uso
3. 🔔 **Alertas** para errores SMTP
4. 🎨 **Personalizar template** de email
5. 🌐 **Soporte multi-idioma**

## 📞 Soporte

Para problemas o preguntas:

1. **Revisar logs** de la aplicación
2. **Ejecutar script** de diagnóstico
3. **Verificar configuración** SMTP
4. **Consultar documentación** del proveedor SMTP

---

**✨ ¡El sistema de email directo está listo para usar!**

Este sistema proporciona una alternativa robusta y confiable al sistema de Supabase Auth, con control total sobre el proceso de recuperación de contraseñas.