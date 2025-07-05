# Guía de Configuración SMTP para ORPA

## Problema Actual

El sistema está experimentando errores al enviar emails de recuperación de contraseña debido a las limitaciones del servicio SMTP por defecto de Supabase.

### Limitaciones del SMTP por Defecto de Supabase

1. **Emails solo a direcciones autorizadas**: Solo envía a miembros del equipo del proyecto
2. **Límite muy restrictivo**: 2-3 emails por hora máximo
3. **Sin garantía de entrega**: Servicio de "mejor esfuerzo" sin SLA
4. **No apto para producción**: Diseñado solo para desarrollo y pruebas

## Soluciones

### Solución Inmediata (Temporal)

1. **Agregar emails autorizados**:
   - Ve al dashboard de Supabase: https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Ve a Settings → Team
   - Agrega los emails de usuarios que necesiten recuperar contraseña como miembros del equipo

2. **Verificar límites de rate**:
   - Espera al menos 1 hora entre intentos de envío
   - Monitorea los logs para verificar si se excede el límite

### Solución Definitiva (Recomendada)

#### Configurar SMTP Personalizado

##### Opción 1: Gmail SMTP (Más Simple)

1. **Configurar Gmail**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: tu-email@gmail.com
   SMTP Password: [App Password - NO tu contraseña normal]
   ```

2. **Generar App Password**:
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos (debe estar habilitada)
   - Contraseñas de aplicaciones → Generar nueva
   - Usa esta contraseña en la configuración SMTP

##### Opción 2: Resend (Recomendado para Producción)

1. **Crear cuenta en Resend**: https://resend.com
2. **Obtener API Key**
3. **Configurar**:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [Tu API Key]
   ```

##### Opción 3: AWS SES (Para Alto Volumen)

1. **Configurar AWS SES**
2. **Obtener credenciales SMTP**
3. **Configurar**:
   ```
   SMTP Host: email-smtp.[region].amazonaws.com
   SMTP Port: 587
   SMTP User: [SMTP Username]
   SMTP Password: [SMTP Password]
   ```

#### Configuración en Supabase

1. **Acceder al Dashboard**:
   - Ve a tu proyecto en Supabase
   - Authentication → Settings
   - Scroll hasta "SMTP Settings"

2. **Habilitar Custom SMTP**:
   - Activa "Enable Custom SMTP"
   - Completa los campos:
     - **Sender email**: no-reply@tudominio.com
     - **Sender name**: ORPA
     - **Host**: [según el proveedor elegido]
     - **Port**: 587 (recomendado)
     - **Username**: [según el proveedor]
     - **Password**: [según el proveedor]

3. **Configurar Rate Limits**:
   - Ve a Authentication → Rate Limits
   - Ajusta "Email sending" a un valor apropiado (ej: 100/hora)

#### Configuración Alternativa via API

```bash
# Obtener access token desde: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="tu-access-token"
export PROJECT_REF="tu-project-ref"

# Configurar SMTP personalizado
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_email_enabled": true,
    "mailer_secure_email_change_enabled": true,
    "mailer_autoconfirm": false,
    "smtp_admin_email": "no-reply@orpainversiones.com",
    "smtp_host": "smtp.resend.com",
    "smtp_port": 587,
    "smtp_user": "resend",
    "smtp_pass": "tu-api-key",
    "smtp_sender_name": "ORPA"
  }'
```

## Verificación

### Después de Configurar SMTP Personalizado

1. **Probar envío**:
   - Intenta el flujo de recuperación de contraseña
   - Verifica que llegue el email
   - Confirma que el enlace funciona

2. **Monitorear logs**:
   - Revisa los logs de Supabase Auth
   - Verifica que no hay errores de SMTP
   - Confirma que se envían los emails exitosamente

### Troubleshooting

#### Error: "Authentication failed"
- Verifica las credenciales SMTP
- Para Gmail, asegúrate de usar App Password, no la contraseña normal
- Verifica que la verificación en 2 pasos esté habilitada en Gmail

#### Error: "Connection timeout"
- Verifica el host y puerto
- Asegúrate de que el firewall no bloquee el puerto 587
- Prueba con puerto 465 (SSL) si 587 no funciona

#### Emails van a spam
- Configura SPF, DKIM y DMARC records en tu dominio
- Usa un dominio verificado para el sender email
- Considera usar un servicio especializado como Resend o SendGrid

## Recomendaciones de Producción

1. **Usar dominio propio**: no-reply@orpainversiones.com
2. **Configurar DNS records**: SPF, DKIM, DMARC
3. **Monitorear métricas**: tasa de entrega, bounces, quejas
4. **Backup provider**: configurar un proveedor secundario
5. **Rate limiting apropiado**: ajustar según el volumen esperado

## Costos Estimados

- **Gmail**: Gratis (hasta ciertos límites)
- **Resend**: $20/mes por 100,000 emails
- **AWS SES**: $0.10 por 1,000 emails
- **SendGrid**: $19.95/mes por 40,000 emails

## Contacto

Para asistencia con la configuración, contacta al equipo de desarrollo o revisa la documentación oficial de Supabase: https://supabase.com/docs/guides/auth/auth-smtp