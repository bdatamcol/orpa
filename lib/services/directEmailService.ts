/**
 * Servicio de envío directo de emails
 * Alternativa a Supabase Auth para envío de emails de recuperación
 */

import * as nodemailer from 'nodemailer';
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
    // Configuración SMTP directa
    this.transporter = nodemailer.createTransport({
      host: 'mail.orpainversiones.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: 'smtpbdatam@orpainversiones.com',
        pass: process.env.SMTP_PASSWORD || 'tu_password_smtp'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    logger.info('DirectEmailService initialized', {
      host: 'mail.orpainversiones.com',
      port: 465,
      secure: true
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
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - ORPA</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
            .content { background: #f7fafc; padding: 30px; }
            .button { 
                display: inline-block; 
                background: #3182ce; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }
            .footer { background: #e2e8f0; padding: 20px; text-align: center; font-size: 12px; }
            .warning { background: #fed7d7; border: 1px solid #fc8181; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Recuperación de Contraseña</h1>
                <p>ORPA Inversiones</p>
            </div>
            
            <div class="content">
                <h2>Hola,</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a la cédula <strong>${cedula}</strong>.</p>
                
                <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este enlace expira en <strong>1 hora</strong></li>
                        <li>Solo puede ser usado una vez</li>
                        <li>Si no solicitaste este cambio, ignora este email</li>
                    </ul>
                </div>
                
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; background: #edf2f7; padding: 10px; border-radius: 3px;">
                    ${resetUrl}
                </p>
                
                <hr style="margin: 30px 0;">
                <p><strong>¿Necesitas ayuda?</strong></p>
                <p>Contacta a nuestro equipo de soporte:</p>
                <ul>
                    <li>📧 Email: soporte@orpainversiones.com</li>
                    <li>📞 Teléfono: +593 XX XXX XXXX</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>© 2024 ORPA Inversiones. Todos los derechos reservados.</p>
                <p>Este es un email automático, por favor no respondas a esta dirección.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
Recuperación de Contraseña - ORPA Inversiones

Hola,

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a la cédula ${cedula}.

Para crear una nueva contraseña, visita el siguiente enlace:
${resetUrl}

IMPORTANTE:
- Este enlace expira en 1 hora
- Solo puede ser usado una vez
- Si no solicitaste este cambio, ignora este email

¿Necesitas ayuda?
Contacta a soporte@orpainversiones.com

© 2024 ORPA Inversiones
    `;

    return {
      subject: '🔐 Recuperación de Contraseña - ORPA Inversiones',
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
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      
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
      await this.transporter.verify();
      logger.info('SMTP connection test successful');
      return true;
    } catch (error: any) {
      logger.error('SMTP connection test failed', error);
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