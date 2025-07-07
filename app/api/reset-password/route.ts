import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AuthService } from '../../../lib/services/authService';
import { logger } from '../../../lib/logger';
import { AuthErrorType } from '../../../types/api';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const authService = new AuthService();

// Store temporal para tokens de reset (en producción usar Redis o base de datos)
const resetTokens = new Map<string, { cedula: string; expires: number }>();

/**
 * POST /api/reset-password
 * Solicita un reset de contraseña enviando un email con token
 */
export async function POST(request: NextRequest) {
  try {
    const { cedula } = await request.json();

    if (!cedula) {
      return NextResponse.json(
        { success: false, error: 'Cédula es requerida' },
        { status: 400 }
      );
    }

    logger.info('Password reset requested', { cedula });

    // Buscar usuario por cédula
    let usuario;
    try {
      usuario = await authService.findUserByCedula(cedula);
    } catch (error: any) {
      if (error.type === AuthErrorType.USER_NOT_FOUND) {
        // Por seguridad, no revelamos si el usuario existe o no
        return NextResponse.json({
          success: true,
          message: 'Si existe una cuenta con esta cédula, recibirás un correo con instrucciones para restablecer tu contraseña.'
        });
      }
      throw error;
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutos

    // Guardar token temporal
    resetTokens.set(resetToken, { cedula: usuario.cedula, expires });

    // URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // Verificar configuración de Resend
    if (!process.env.RESEND_API_KEY) {
      logger.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Servicio de email no configurado. Contacta al administrador.' },
        { status: 500 }
      );
    }

    // Enviar email con Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'ORPA Inversiones <noreply@orpainversiones.com>',
        to: [usuario.correo],
        subject: 'Restablecer contraseña - ORPA Inversiones',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer contraseña - ORPA Inversiones</title>
            <style>
              @media only screen and (max-width: 600px) {
                .container { width: 100% !important; padding: 10px !important; }
                .header { padding: 20px !important; }
                .content { padding: 20px !important; }
                .button { padding: 12px 24px !important; font-size: 14px !important; }
              }
            </style>
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f6f6f6;">
            <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <!-- Header -->
              <div class="header" style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 1px;">ORPA</h1>
                <p style="color: #f8c327; margin: 5px 0 0 0; font-size: 16px; font-weight: 500;">Inversiones</p>
              </div>
              
              <!-- Content -->
              <div class="content" style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 30px;">Restablecer tu contraseña</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong style="color: #b2570b;">${usuario.nombre1 ? (usuario.nombre1 + (usuario.apellido1 ? ' ' + usuario.apellido1 : '')) : 'Usuario'}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta asociada a la cédula <strong style="color: #333;">${usuario.cedula}</strong>.</p>
                
                <p style="font-size: 16px; margin-bottom: 30px; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.</p>
                
                <!-- Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" class="button"
                     style="background: #f8c327; 
                            color: #000; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            display: inline-block;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 12px rgba(248, 195, 39, 0.3);">
                    🔐 Restablecer Contraseña
                  </a>
                </div>
                
                <!-- Info Box -->
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⏰ Importante:</strong> Este enlace expirará en <strong>15 minutos</strong> por seguridad.
                  </p>
                </div>
                
                <!-- Alternative Link -->
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                  <p style="margin: 0;">
                    <a href="${resetUrl}" style="color: #b2570b; word-break: break-all; font-size: 13px;">${resetUrl}</a>
                  </p>
                </div>
                
                <!-- Divider -->
                <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 40px 0 30px 0;">
                
                <!-- Footer Info -->
                <div style="text-align: center;">
                  <p style="font-size: 13px; color: #999; margin: 0 0 10px 0;">
                    Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
                  </p>
                  <p style="font-size: 12px; color: #ccc; margin: 0;">
                    © ${new Date().getFullYear()} ORPA Inversiones. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });

      logger.info('Password reset email sent successfully', { 
        cedula: usuario.cedula, 
        email: usuario.correo.substring(0, 3) + '***',
        emailId: emailResult.data?.id,
        resendResponse: emailResult.data
      });

      // Log adicional para debugging
      logger.debug('Resend email details', {
        to: usuario.correo,
        emailId: emailResult.data?.id,
        timestamp: new Date().toISOString()
      });

    } catch (emailError: any) {
      logger.error('Failed to send password reset email', emailError instanceof Error ? emailError : new Error(String(emailError)), {
        errorMessage: emailError?.message,
        errorName: emailError?.name,
        cedula: usuario.cedula,
        email: usuario.correo.substring(0, 3) + '***',
        resendApiKey: process.env.RESEND_API_KEY ? 'Configured' : 'Missing'
      });
      
      // Análisis específico del error para mejor debugging
      let errorDetails = 'Error desconocido';
      if (emailError?.message?.includes('API key')) {
        errorDetails = 'API Key inválida o faltante';
      } else if (emailError?.message?.includes('domain')) {
        errorDetails = 'Problema con dominio de envío';
      } else if (emailError?.message?.includes('rate')) {
        errorDetails = 'Límite de envío excedido';
      }
      
      logger.error('Email error analysis', emailError instanceof Error ? emailError : new Error(String(emailError)), { errorDetails });
      
      // No revelar el error específico al usuario por seguridad
      return NextResponse.json(
        { success: false, error: 'Error al enviar el correo. Inténtalo de nuevo más tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Si existe una cuenta con esta cédula, recibirás un correo con instrucciones para restablecer tu contraseña.'
    });

  } catch (error) {
    logger.error('Password reset request failed', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reset-password?token=xxx
 * Valida un token de reset de contraseña
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token es requerido' },
        { status: 400 }
      );
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { success: false, error: 'Token expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { cedula: tokenData.cedula }
    });

  } catch (error) {
    logger.error('Token validation failed', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reset-password
 * Actualiza la contraseña usando un token válido
 */
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { success: false, error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Actualizar la contraseña en la base de datos
    try {
      await authService.updatePasswordByCedula(tokenData.cedula, newPassword);
      logger.info('Password reset completed', { cedula: tokenData.cedula });
    } catch (error: any) {
      logger.error('Failed to update password', error instanceof Error ? error : new Error(String(error)), { cedula: tokenData.cedula });
      return NextResponse.json(
        { success: false, error: error.message || 'Error al actualizar la contraseña' },
        { status: 500 }
      );
    }
    
    // Eliminar token usado
    resetTokens.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    logger.error('Password reset failed', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Limpiar tokens expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expires) {
      resetTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);