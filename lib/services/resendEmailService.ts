/**
 * Servicio de envío de emails usando Resend
 * Alternativa moderna y confiable al SMTP tradicional
 */

import { Resend } from 'resend';
import { logger } from '../logger';
import crypto from 'crypto';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface ResetTokenData {
  email: string;
  token: string;
  expiresAt: Date;
  cedula: string;
}

export class ResendEmailService {
  private resend: Resend;
  private resetTokens: Map<string, ResetTokenData> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  
  // Configuración para modo testing
  private readonly AUTHORIZED_EMAILS = [
    'digital@bdatam.com',
    'admin@orpainversiones.com',
    'trabajobilou@gmail.com'
  ];
  private readonly FALLBACK_EMAIL = 'digital@bdatam.com';

  constructor() {
    // Inicializar Resend con la API key
    const apiKey = process.env.RESEND_API_KEY || 're_TzHs3o7J_BHRQZAduxQfpJgniyPW2noXV';
    this.resend = new Resend(apiKey);
    
    logger.info('ResendEmailService initialized');
  }

  /**
   * Genera un token seguro para reset de contraseña
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crea el template HTML para el email de recuperación en modo testing
   */
  private createTestTemplate(resetUrl: string, cedula: string, originalEmail: string): EmailTemplate {
    const subject = '[TEST] Recuperación de Contraseña - ORPA';
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - MODO TEST</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .test-banner {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
          }
          .test-banner strong {
            color: #856404;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
          }
          .user-info {
            background: #e3f2fd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f8c327 0%, #fad64f 100%);
            color: #000;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="test-banner">
            <strong>🧪 MODO TESTING</strong><br>
            Este email se envió a ${this.FALLBACK_EMAIL} para pruebas.<br>
            Email real del usuario: <strong>${originalEmail}</strong>
          </div>
          
          <div class="header">
            <div class="logo">ORPA</div>
            <h1 class="title">Recuperación de Contraseña</h1>
          </div>
          
          <div class="user-info">
            <strong>📋 Información del Usuario:</strong><br>
            Cédula: ${cedula}<br>
            Email: ${originalEmail}
          </div>
          
          <div class="content">
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ORPA.</p>
            <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p><strong>⏰ Este enlace expirará en 1 hora por seguridad.</strong></p>
            
            <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 14px; color: #666;">
              Por tu seguridad, nunca compartas este enlace con nadie.<br>
              Si tienes problemas con el botón, copia y pega este enlace en tu navegador:<br>
              <a href="${resetUrl}" style="color: #666; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
[MODO TEST] Recuperación de Contraseña - ORPA

Email real del usuario: ${originalEmail}
Cédula: ${cedula}

Recibimos una solicitud para restablecer tu contraseña.

Para restablecer tu contraseña, visita este enlace:
${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignora este email.

---
ORPA - Sistema de Gestión
    `;
    
    return { subject, html, text };
  }

  /**
   * Crea el template HTML para el email de recuperación
   */
  private createPasswordResetTemplate(resetUrl: string, cedula: string): EmailTemplate {
    const subject = 'Recuperación de Contraseña - ORPA';
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f8c327 0%, #fad64f 100%);
            color: #000;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #f8c327;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .link {
            color: #f8c327;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ORPA</div>
            <h1 class="title">Recuperación de Contraseña</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a la cédula <strong>${cedula}</strong>.</p>
            
            <div class="info-box">
              <strong>📧 Enviado por Resend</strong><br>
              Este email fue enviado usando nuestro nuevo sistema de entrega confiable.
            </div>
            
            <p>Para establecer una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">🔑 Restablecer Contraseña</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en <strong>1 hora</strong></li>
                <li>Solo puede ser usado <strong>una vez</strong></li>
                <li>Si no solicitaste este cambio, ignora este email</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Este email fue enviado por <strong>ORPA</strong></p>
            <p>Si tienes problemas, contacta a <a href="mailto:soporte@orpainversiones.com" class="link">soporte@orpainversiones.com</a></p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} ORPA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
ORPA - Recuperación de Contraseña

Hola,

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a la cédula ${cedula}.

Para establecer una nueva contraseña, visita el siguiente enlace:
${resetUrl}

Importante:
- Este enlace expirará en 1 hora
- Solo puede ser usado una vez
- Si no solicitaste este cambio, ignora este email

Si tienes problemas, contacta a soporte@orpainversiones.com

© ${new Date().getFullYear()} ORPA. Todos los derechos reservados.
    `;

    return { subject, html, text };
  }

  /**
   * Verifica rate limiting por IP
   */
  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(ip);
    
    if (!limit) {
      this.rateLimits.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hora
      return true;
    }
    
    if (now > limit.resetTime) {
      this.rateLimits.set(ip, { count: 1, resetTime: now + 3600000 });
      return true;
    }
    
    if (limit.count >= 3) {
      return false;
    }
    
    limit.count++;
    return true;
  }

  /**
   * Envía email de recuperación de contraseña usando Resend
   */
  async sendPasswordResetEmail(
    email: string, 
    cedula: string, 
    ip?: string
  ): Promise<{ success: boolean; token?: string; expiresAt?: Date; message?: string }> {
    try {
      // Verificar rate limiting
      if (ip && !this.checkRateLimit(ip)) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`);
        return {
          success: false,
          message: 'Demasiados intentos. Intenta nuevamente en una hora.'
        };
      }

      // Generar token
      const token = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora
      
      // Almacenar token
      this.resetTokens.set(token, {
        email,
        token,
        expiresAt,
        cedula
      });

      // Crear URL de reset
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/auth/reset-password-direct?token=${token}&email=${encodeURIComponent(email)}`;

      // Determinar si usar modo testing
      const isTestingMode = !this.AUTHORIZED_EMAILS.includes(email);
      const targetEmail = isTestingMode ? this.FALLBACK_EMAIL : email;
      
      // Crear template
      const template = isTestingMode 
        ? this.createTestTemplate(resetUrl, cedula, email)
        : this.createPasswordResetTemplate(resetUrl, cedula);

      // Configurar el remitente según el entorno
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
      const fromEmail = isProduction 
        ? 'ORPA Inversiones <noreply@orpainversiones.com>'
        : 'ORPA <onboarding@resend.dev>';
      
      // Enviar email usando Resend
      const result = await this.resend.emails.send({
        from: fromEmail,
        to: [targetEmail],
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [
          { name: 'category', value: 'password-reset' },
          { name: 'cedula', value: cedula },
          { name: 'environment', value: isProduction ? 'production' : 'development' }
        ]
      });

      if (result.error) {
        logger.error('Resend email error:', result.error);
        return {
          success: false,
          message: 'Error al enviar el email. Intenta nuevamente.'
        };
      }

      if (isTestingMode) {
        logger.info(`🧪 [MODO TEST] Email enviado a ${targetEmail} (email real: ${email})`, {
          emailId: result.data?.id,
          originalEmail: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
          testEmail: targetEmail,
          cedula: cedula.replace(/(.{2}).*(.{2})/, '$1***$2'),
          expiresAt
        });
        logger.info(`ℹ️  Para producción, configure un dominio verificado en Resend`);
      } else {
        logger.info(`Password reset email sent via Resend`, {
          emailId: result.data?.id,
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
          cedula: cedula.replace(/(.{2}).*(.{2})/, '$1***$2'), // Mask cedula
          expiresAt
        });
      }

      return {
        success: true,
        token,
        expiresAt,
        message: isTestingMode 
          ? `Email de prueba enviado a ${targetEmail} (usuario real: ${email})`
          : 'Email enviado exitosamente'
      };

    } catch (error) {
      logger.error('Error sending password reset email:', error instanceof Error ? error : undefined);
      return {
        success: false,
        message: 'Error interno al enviar el email'
      };
    }
  }

  /**
   * Valida un token de reset
   */
  async validateResetToken(token: string, email: string): Promise<boolean> {
    try {
      const tokenData = this.resetTokens.get(token);
      
      if (!tokenData) {
        logger.warn(`Invalid token attempted: ${token.substring(0, 8)}...`);
        return false;
      }
      
      if (tokenData.email !== email) {
        logger.warn(`Token email mismatch: expected ${tokenData.email}, got ${email}`);
        return false;
      }
      
      if (new Date() > tokenData.expiresAt) {
        logger.warn(`Expired token attempted: ${token.substring(0, 8)}...`);
        this.resetTokens.delete(token);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating reset token:', error instanceof Error ? error : undefined);
      return false;
    }
  }

  /**
   * Consume un token (lo marca como usado)
   */
  async consumeResetToken(token: string, email: string): Promise<boolean> {
    try {
      const isValid = await this.validateResetToken(token, email);
      
      if (isValid) {
        this.resetTokens.delete(token);
        logger.info(`Token consumed successfully: ${token.substring(0, 8)}...`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error consuming reset token:', error instanceof Error ? error : undefined);
      return false;
    }
  }

  /**
   * Limpia tokens expirados
   */
  cleanupExpiredTokens(): void {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired tokens`);
    }
  }

  /**
   * Prueba la conexión con Resend
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Resend no tiene un método de test directo, pero podemos verificar la API key
      const testEmail = {
        from: 'ORPA <onboarding@resend.dev>',
        to: ['test@resend.dev'], // Email especial de Resend para pruebas
        subject: 'Test de Conexión - ORPA',
        html: '<p>Este es un email de prueba para verificar la conexión con Resend.</p>'
      };

      const result = await this.resend.emails.send(testEmail);
      
      if (result.error) {
        return {
          success: false,
          message: `Error de conexión: ${result.error.message}`
        };
      }

      return {
        success: true,
        message: `Conexión exitosa. Email ID: ${result.data?.id}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats() {
    return {
      activeTokens: this.resetTokens.size,
      rateLimitedIPs: this.rateLimits.size,
      service: 'Resend'
    };
  }
}

// Instancia singleton
export const resendEmailService = new ResendEmailService();

// Limpieza automática cada 30 minutos
setInterval(() => {
  resendEmailService.cleanupExpiredTokens();
}, 30 * 60 * 1000);

// Limpieza de rate limits cada hora
setInterval(() => {
  const now = Date.now();
  for (const [ip, limit] of resendEmailService['rateLimits'].entries()) {
    if (now > limit.resetTime) {
      resendEmailService['rateLimits'].delete(ip);
    }
  }
}, 60 * 60 * 1000);