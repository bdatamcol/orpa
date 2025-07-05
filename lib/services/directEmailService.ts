/**
 * Servicio de envío directo de emails
 * Alternativa a Supabase Auth para envío de emails de recuperación
 */

import nodemailer from 'nodemailer';
import { logger } from '../logger';
import { getConfig } from '../config';
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

export class DirectEmailService {
  private transporter!: nodemailer.Transporter;
  private config: ReturnType<typeof getConfig>;
  private resetTokens: Map<string, ResetTokenData> = new Map();

  constructor() {
    this.config = getConfig();
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Configuración SMTP usando variables de entorno
    const smtpHost = process.env.SMTP_HOST || 'mail.orpainversiones.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'micuenta@orpainversiones.com';
    const smtpPass = process.env.SMTP_PASS || 'U-IM5mVqroaoDrO';
    
    // Puerto 587 usa STARTTLS, puerto 465 usa SSL directo
    const isSSL = smtpPort === 465;
    
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSSL, // true para 465, false para otros puertos
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      },
      // Configuraciones adicionales para debugging
      debug: true,
      logger: true
    });

    logger.info('DirectEmailService initialized', {
      host: smtpHost,
      port: smtpPort,
      secure: isSSL,
      user: smtpUser.substring(0, 3) + '***'
    });
  }

  /**
   * Genera un token seguro para recuperación de contraseña
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crea el template HTML para email de recuperación
   */
  private createPasswordResetTemplate(resetUrl: string, cedula: string): EmailTemplate {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Restablecer contraseña</title>
      <style>
        body {
          background-color: #f9fafb;
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          color: #111827;
        }
        .container {
          max-width: 480px;
          margin: 40px auto;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          padding: 32px;
          text-align: center;
        }
        .title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .description {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4f46e5;
          color: #ffffff !important;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: background-color 0.2s ease;
        }
        .btn:hover {
          background-color: #4338ca;
        }
        .footer {
          margin-top: 32px;
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Restablecer contraseña</div>
        <div class="description">
          Has solicitado restablecer la contraseña de tu cuenta.<br>
          Haz clic en el siguiente botón para continuar:
        </div>
        <a href="${resetUrl}" class="btn">Restablecer contraseña</a>
        <div class="footer">
          Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
Restablecer contraseña

Has solicitado restablecer la contraseña de tu cuenta.

Para continuar, visita el siguiente enlace:
${resetUrl}

Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
    `;

    return {
      subject: 'Restablecer contraseña',
      html,
      text
    };
  }

  /**
   * Envía email de recuperación de contraseña directamente
   */
  async sendPasswordResetEmail(email: string, cedula: string): Promise<{ token: string; expiresAt: Date }> {
    try {
      // Generar token único
      const token = this.generateResetToken();
      // Usar configuración de expiración desde variables de entorno (en segundos)
      const expirySeconds = parseInt(process.env.NEXT_PUBLIC_RESET_PASSWORD_EXPIRY || '86400'); // 24 horas por defecto
      const expiresAt = new Date(Date.now() + expirySeconds * 1000);
      
      // Guardar token en memoria (en producción usar Redis o base de datos)
      this.resetTokens.set(token, {
        email,
        token,
        expiresAt,
        cedula
      });

      // Crear URL de recuperación
      const resetUrl = `${this.config.siteUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      // Crear template del email
      const template = this.createPasswordResetTemplate(resetUrl, cedula);
      
      // Configurar email
      const mailOptions = {
        from: {
          name: 'ORPA Inversiones',
          address: 'noreply@orpainversiones.com'
        },
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      logger.info('Sending direct password reset email', {
        email: email.substring(0, 3) + '***',
        cedula: cedula.substring(0, 4) + '***',
        resetUrl: resetUrl.substring(0, 50) + '...',
        expiresAt
      });

      // Enviar email
      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Password reset email sent successfully', {
        messageId: result.messageId,
        email: email.substring(0, 3) + '***',
        accepted: result.accepted?.length || 0,
        rejected: result.rejected?.length || 0
      });

      return { token, expiresAt };
      
    } catch (error: any) {
      logger.error('Failed to send password reset email', error, {
        email: email.substring(0, 3) + '***',
        cedula: cedula.substring(0, 4) + '***',
        errorMessage: error.message,
        errorCode: error.code
      });
      
      throw new Error(`Error al enviar email de recuperación: ${error.message}`);
    }
  }

  /**
   * Valida un token de recuperación
   */
  validateResetToken(token: string): ResetTokenData | null {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData) {
      logger.warn('Invalid reset token attempted', { token: token.substring(0, 8) + '***' });
      return null;
    }
    
    if (new Date() > tokenData.expiresAt) {
      logger.warn('Expired reset token attempted', { 
        token: token.substring(0, 8) + '***',
        expiresAt: tokenData.expiresAt
      });
      this.resetTokens.delete(token);
      return null;
    }
    
    return tokenData;
  }

  /**
   * Consume un token (lo elimina después de usar)
   */
  consumeResetToken(token: string): ResetTokenData | null {
    const tokenData = this.validateResetToken(token);
    
    if (tokenData) {
      this.resetTokens.delete(token);
      logger.info('Reset token consumed', {
        email: tokenData.email.substring(0, 3) + '***',
        cedula: tokenData.cedula.substring(0, 4) + '***'
      });
    }
    
    return tokenData;
  }

  /**
   * Limpia tokens expirados (ejecutar periódicamente)
   */
  cleanupExpiredTokens(): void {
    const now = new Date();
    let cleaned = 0;
    
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('Cleaned up expired reset tokens', { count: cleaned });
    }
  }

  /**
   * Verifica la conexión SMTP
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing SMTP connection...');
      const result = await this.transporter.verify();
      logger.info('SMTP connection test successful', { result });
      return true;
    } catch (error: any) {
      logger.error('SMTP connection test failed', error, {
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack
      });
      return false;
    }
  }

  /**
   * Envía un email de prueba para verificar la configuración
   */
  async sendTestEmail(toEmail: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: 'ORPA Inversiones - Test',
          address: process.env.SMTP_FROM || 'noreply@orpainversiones.com'
        },
        to: toEmail,
        subject: 'Test de Configuración SMTP - ORPA',
        text: 'Este es un correo de prueba para verificar la configuración SMTP.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Test de Configuración SMTP</h2>
            <p>Este es un correo de prueba para verificar que la configuración SMTP está funcionando correctamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-EC')}</p>
            <p><strong>Servidor:</strong> ${process.env.SMTP_HOST}</p>
            <p><strong>Puerto:</strong> ${process.env.SMTP_PORT}</p>
            <hr>
            <p><small>ORPA Inversiones - Sistema de Correos</small></p>
          </div>
        `
      };

      logger.info('Sending test email', {
        to: toEmail.substring(0, 3) + '***',
        from: mailOptions.from.address
      });

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Test email sent successfully', {
        messageId: result.messageId,
        accepted: result.accepted?.length || 0,
        rejected: result.rejected?.length || 0,
        response: result.response
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to send test email', error, {
        to: toEmail.substring(0, 3) + '***',
        errorMessage: error.message,
        errorCode: error.code
      });
      return false;
    }
  }
}

// Instancia singleton
export const directEmailService = new DirectEmailService();

// Limpiar tokens expirados cada 30 minutos
setInterval(() => {
  directEmailService.cleanupExpiredTokens();
}, 30 * 60 * 1000);