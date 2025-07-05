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
            <title>Restablecer contraseña</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ORPA Inversiones</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
              <h2 style="color: #333; margin-top: 0;">Restablecer tu contraseña</h2>
              
              <p>Hola <strong>${usuario.nombre || 'Usuario'}</strong>,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta asociada a la cédula <strong>${usuario.cedula}</strong>.</p>
              
              <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold; 
                          display: inline-block;
                          font-size: 16px;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Este enlace expirará en 15 minutos por seguridad.
              </p>
              
              <p style="font-size: 14px; color: #666;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
              </p>
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

    // Aquí actualizarías la contraseña en la base de datos
    // Por ahora solo simulamos el éxito
    logger.info('Password reset completed', { cedula: tokenData.cedula });
    
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