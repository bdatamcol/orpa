import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/services/authService';
import { directEmailService } from '../../../lib/services/directEmailService';
import { logger } from '../../../lib/logger';
import { applyRateLimit, markRequestAsSuccessful, rateLimitConfigs } from '../../../lib/middleware/rateLimit';
import { ResetPasswordRequest, ResetPasswordResponse } from '../../../types/api';

/**
 * API Route para envío directo de emails de recuperación
 * Alternativa que no depende de Supabase Auth
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Aplicar rate limiting
    applyRateLimit(request, rateLimitConfigs.auth);
    
    const body: ResetPasswordRequest = await request.json();
    const { cedula } = body;

    if (!cedula) {
      logger.warn('Direct password reset request missing cedula', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent')
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cédula es requerida',
          error: 'MISSING_CEDULA'
        } as ResetPasswordResponse,
        { status: 400 }
      );
    }

    logger.info('Direct password reset request initiated', {
      cedula: cedula.substring(0, 4) + '***',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });

    const authService = new AuthService();
    
    // Buscar usuario por cédula
    const user = await authService.findUserByCedula(cedula);
    
    // Enviar email directamente usando nuestro servicio
    const { token, expiresAt } = await directEmailService.sendPasswordResetEmail(user.correo, cedula);
    
    // Marcar como exitoso para rate limiting
    markRequestAsSuccessful(request, rateLimitConfigs.auth);
    
    const duration = Date.now() - startTime;
    
    logger.info('Direct password reset email sent successfully', {
      cedula: cedula.substring(0, 4) + '***',
      email: user.correo.substring(0, 3) + '***',
      duration,
      expiresAt,
      tokenLength: token.length
    });

    const response: ResetPasswordResponse = {
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y spam.',
      details: `El enlace expira en 1 hora (${expiresAt.toLocaleString('es-EC')})`
    };

    return NextResponse.json(response, { status: 200 });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Direct password reset failed', error, {
      duration,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      errorMessage: error.message,
      errorStack: error.stack
    });

    // Determinar tipo de error y respuesta apropiada
    if (error.message?.includes('Usuario no encontrado')) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se encontró un usuario con esa cédula.',
          error: 'USER_NOT_FOUND'
        } as ResetPasswordResponse,
        { status: 404 }
      );
    }

    if (error.message?.includes('SMTP') || error.message?.includes('email')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Error temporal del servicio de email. Intenta nuevamente en unos minutos.',
          error: 'EMAIL_SERVICE_ERROR',
          details: 'Servicio de email no disponible temporalmente'
        } as ResetPasswordResponse,
        { status: 503 }
      );
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        } as ResetPasswordResponse,
        { status: 429 }
      );
    }

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor. Intenta nuevamente más tarde.',
        error: 'INTERNAL_SERVER_ERROR'
      } as ResetPasswordResponse,
      { status: 500 }
    );
  }
}