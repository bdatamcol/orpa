# 🔧 Guía de Solución de Problemas - Sistema de Recuperación de Contraseñas

## 🎯 Problema Resuelto: "Email no se envía"

### ✅ Diagnóstico Completado

**Problema identificado**: La aplicación estaba intentando acceder a la tabla `users` que no existe en Supabase.

**Tabla correcta**: `usuario` (singular)

### 🔧 Soluciones Aplicadas

#### 1. Corrección de Tabla en API Endpoints

**Archivos corregidos**:
- `app/api/send-password-email-resend/route.ts`
- `app/api/update-password-direct/route.ts`

**Cambio realizado**:
```javascript
// ❌ Antes (incorrecto)
const { data: user, error: userError } = await supabase
  .from('users')  // Tabla inexistente
  .select('email, cedula')

// ✅ Después (correcto)
const { data: user, error: userError } = await supabase
  .from('usuario')  // Tabla correcta
  .select('email, cedula')
```

#### 2. Verificación de Usuarios Existentes

**Usuarios válidos encontrados en la base de datos**:
- Cédula: `1090453784` - Email: `miguelucho_909@hotmail.com`
- Cédula: `1090178379` - Email: `digital@bdatam.com`

#### 3. Sistema Resend Configurado

**Estado**: ✅ **FUNCIONANDO CORRECTAMENTE**

- API Key configurada: `re_TzHs3o7J_BHRQZAduxQfpJgniyPW2noXV`
- Dominio temporal: `onboarding@resend.dev` (verificado)
- Pruebas de conexión: ✅ Exitosas
- Templates de email: ✅ Configurados

## 🧪 Cómo Probar el Sistema

### Método 1: Interfaz Web
1. Ir a: http://localhost:3000/auth/forgot-password
2. Ingresar una cédula válida: `1090453784`
3. Hacer clic en "Recuperar Contraseña"
4. Verificar en dashboard de Resend: https://resend.com/emails

### Método 2: Script de Prueba
```bash
# Ejecutar script con usuarios reales
node scripts/test-real-user.js

# O usar el script de Resend
npm run test-resend-email
```

### Método 3: API Directa
```bash
curl -X POST http://localhost:3000/api/send-password-email-resend \
  -H "Content-Type: application/json" \
  -d '{"cedula": "1090453784"}'
```

## 📊 Verificación de Resultados

### ✅ Indicadores de Éxito

1. **Respuesta de API**:
```json
{
  "success": true,
  "message": "Email enviado exitosamente. Revisa tu bandeja de entrada.",
  "expiresAt": "2025-01-05T15:30:00.000Z",
  "service": "Resend"
}
```

2. **Logs del Servidor**:
```
{"level":"info","message":"Password reset email sent successfully via Resend"}
```

3. **Dashboard de Resend**:
- Email aparece con estado "Delivered"
- Subject: "Recuperación de Contraseña - ORPA"
- From: "ORPA <onboarding@resend.dev>"

### ❌ Indicadores de Problema

1. **Usuario no encontrado**:
```
{"level":"warn","message":"User not found for cedula: XX***XX"}
```
**Solución**: Usar una cédula válida de la base de datos

2. **Error de dominio**:
```
"The orpainversiones.com domain is not verified"
```
**Solución**: Ya resuelto usando `onboarding@resend.dev`

3. **Error de API Key**:
```
"Invalid API key"
```
**Solución**: Verificar `RESEND_API_KEY` en `.env.production`

## 🔄 Flujo Completo de Recuperación

### 1. Solicitud de Recuperación
```
Usuario ingresa cédula → API busca en tabla 'usuario' → Genera token → Envía email via Resend
```

### 2. Email Recibido
```
Email con template HTML → Botón "Restablecer Contraseña" → URL con token
```

### 3. Actualización de Contraseña
```
Usuario hace clic → Página reset-password-direct → API valida token → Actualiza contraseña
```

## 🚀 Estado Actual del Sistema

### ✅ Componentes Funcionando
- ✅ Servicio Resend configurado
- ✅ API endpoints corregidos
- ✅ Base de datos conectada
- ✅ Templates de email listos
- ✅ Tokens de seguridad funcionando
- ✅ Rate limiting activo

### 🔄 Pendientes (Opcionales)
1. **Verificar dominio propio**: `orpainversiones.com` en Resend
2. **Configurar webhooks**: Para tracking avanzado
3. **Métricas de producción**: Monitoreo y alertas

## 📧 Información de Contacto y Recursos

### Resend Dashboard
- **Emails**: https://resend.com/emails
- **Domains**: https://resend.com/domains
- **API Keys**: https://resend.com/api-keys

### Archivos Importantes
- **Servicio**: `lib/services/resendEmailService.ts`
- **API Resend**: `app/api/send-password-email-resend/route.ts`
- **API Update**: `app/api/update-password-direct/route.ts`
- **Frontend**: `app/auth/forgot-password/page.tsx`

### Scripts de Utilidad
- **Prueba Resend**: `npm run test-resend-email`
- **Verificar usuarios**: `node scripts/check-users.js`
- **Prueba real**: `node scripts/test-real-user.js`

## 🎉 Conclusión

**El problema principal ha sido resuelto**: La corrección de la tabla de `users` a `usuario` permite que el sistema encuentre usuarios válidos y envíe emails correctamente.

**Sistema listo para producción** con Resend como servicio de email confiable.

---

*Guía actualizada: ${new Date().toISOString()}*
*Estado: ✅ PROBLEMA RESUELTO*