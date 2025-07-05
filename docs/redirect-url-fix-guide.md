# Guía de Solución: Error de URL de Redirección en Supabase

## Problema Identificado

El error "Error sending recovery email" que persiste a pesar de tener configurado un SMTP personalizado se debe a una **discrepancia en las URLs de redirección**.

### Análisis del Problema

1. **URL en logs**: `https://micuenta.orpainversiones.com/auth/reset-password`
2. **URL en .env.production** (antes): `https://micuentacorporaversiones.com`
3. **Resultado**: Supabase rechaza la URL de redirección porque no está autorizada

## Solución Implementada

### 1. Corrección de Variables de Entorno

✅ **Actualizado `.env.production`**:
```bash
# Antes
NEXT_PUBLIC_SITE_URL=https://micuentacorporaversiones.com
NEXT_PUBLIC_SUPPORT_EMAIL=soporte@micuentacorporaversiones.com

# Después
NEXT_PUBLIC_SITE_URL=https://micuenta.orpainversiones.com
NEXT_PUBLIC_SUPPORT_EMAIL=soporte@orpainversiones.com
```

### 2. Configuración en Supabase Dashboard

**PASO CRÍTICO**: Debes agregar las URLs autorizadas en Supabase:

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard/project/smirsvavqrhqwzflhbwg)
2. Navega a **Authentication > URL Configuration**
3. En **Redirect URLs**, agrega:
   ```
   https://micuenta.orpainversiones.com/**
   https://micuenta.orpainversiones.com/auth/reset-password
   http://localhost:3000/** (para desarrollo)
   ```

### 3. Verificación de SMTP Personalizado

1. Ve a **Authentication > Settings > SMTP Settings**
2. Confirma que **Enable Custom SMTP** esté activado
3. Verifica las credenciales SMTP:
   ```
   Host: mail.orpainversiones.com
   Port: 465
   Username: smtpbdatam@orpainversiones.com
   SSL: Enabled
   ```

## Scripts de Diagnóstico

### Ejecutar Diagnóstico
```bash
npm run fix-redirect-url
```

Este script:
- ✅ Identifica discrepancias de URL
- ✅ Muestra enlaces directos al dashboard
- ✅ Proporciona pasos específicos de corrección

### Probar SMTP
```bash
npm run smtp-diagnostic
```

## Pasos de Implementación

### 1. Reiniciar la Aplicación
```bash
# Si estás usando PM2 o similar
pm2 restart orpa-app

# O reinicia tu servidor de desarrollo
npm run dev
```

### 2. Verificar Variables de Entorno
```bash
# Verificar que las variables se carguen correctamente
node -e "console.log('SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)"
```

### 3. Probar el Flujo Completo
1. Ir a la página de recuperación de contraseña
2. Ingresar una cédula válida
3. Verificar que el email se envíe sin errores
4. Confirmar que el enlace de recuperación funcione

## Errores Comunes y Soluciones

### Error: "Invalid redirect URL"
**Causa**: La URL no está en la lista de URLs autorizadas
**Solución**: Agregar la URL en Supabase Dashboard > Authentication > URL Configuration

### Error: "Email address not authorized"
**Causa**: Supabase está usando el SMTP por defecto en lugar del personalizado
**Solución**: Verificar que el SMTP personalizado esté habilitado y configurado correctamente

### Error: "Rate limit exceeded"
**Causa**: Límites de envío de email
**Solución**: Ajustar los límites en Authentication > Settings > Rate Limits

## Verificación Post-Implementación

### Checklist de Verificación
- [ ] Variables de entorno actualizadas
- [ ] URLs autorizadas agregadas en Supabase
- [ ] SMTP personalizado habilitado
- [ ] Aplicación reiniciada
- [ ] Flujo de recuperación probado

### Logs Esperados (Éxito)
```json
{
  "level": "info",
  "message": "Password reset email sent successfully",
  "meta": {
    "email": "tes***",
    "redirectUrl": "https://micuenta.orpainversiones.com/auth/reset-password"
  }
}
```

## Monitoreo Continuo

### Alertas a Configurar
1. **Errores de envío de email** > 5% en 1 hora
2. **URLs de redirección rechazadas** > 0 en 1 día
3. **Fallos de SMTP personalizado** > 0 en 1 día

### Métricas a Monitorear
- Tasa de éxito de envío de emails
- Tiempo de respuesta del SMTP
- Errores de configuración de URLs

## Contacto y Soporte

Si el problema persiste después de seguir esta guía:

1. **Ejecutar diagnóstico**: `npm run fix-redirect-url`
2. **Revisar logs**: Buscar errores específicos en los logs de la aplicación
3. **Verificar Supabase**: Confirmar configuración en el dashboard
4. **Contactar soporte**: Incluir logs específicos y configuración actual

---

**Última actualización**: $(date)
**Versión**: 1.0
**Estado**: Solución implementada - Pendiente de verificación