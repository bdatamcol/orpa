import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../lib/services/authService';
import { logger } from '../../../lib/logger';
import { applyRateLimit, markRequestAsSuccessful, rateLimitConfigs } from '../../../lib/middleware/rateLimit';
import { ResetPasswordRequest, ResetPasswordResponse, AuthError, AuthErrorType } from '../../../types/api';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Aplicar rate limiting
    applyRateLimit(request, rateLimitConfigs.auth);
    
    const body: ResetPasswordRequest = await request.json();
    const { cedula } = body;

    if (!cedula) {
      logger.warn('Password reset request missing cedula', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent')
      });
      
      const response: ResetPasswordResponse = {
        success: false,
        message: "Error de validación",
        error: "Cédula es requerida"
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    logger.info('Password reset request initiated', {
      cedula: cedula.toString().substring(0, 4) + '***', // Log parcial por seguridad
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });

    // Crear instancia del servicio de autenticación
    const authService = new AuthService();
    
    // Procesar restablecimiento de contraseña
    await authService.resetPasswordByCedula(cedula.toString());
    
    // Marcar request como exitosa para rate limiting
    markRequestAsSuccessful(request, rateLimitConfigs.auth);
    
    const duration = Date.now() - startTime;
    logger.info('Password reset completed successfully', {
      cedula: cedula.toString().substring(0, 4) + '***',
      duration,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    const response: ResetPasswordResponse = {
      success: true,
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico"
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Manejar errores de autenticación estructurados
    if (error.type && Object.values(AuthErrorType).includes(error.type)) {
      const authError = error as AuthError;
      
      logger.warn('Authentication error occurred', {
        type: authError.type,
        message: authError.message,
        details: authError.details,
        meta: authError.meta,
        duration,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
      
      const response: ResetPasswordResponse = {
        success: false,
        message: "Error de autenticación",
        error: authError.message,
        details: authError.details
      };
      
      // Mapear tipos de error a códigos HTTP apropiados
      const statusCode = {
        [AuthErrorType.INVALID_CEDULA]: 400,
        [AuthErrorType.INVALID_EMAIL]: 400,
        [AuthErrorType.USER_NOT_FOUND]: 404,
        [AuthErrorType.EMAIL_NOT_REGISTERED]: 404,
        [AuthErrorType.PERMISSION_DENIED]: 500,
        [AuthErrorType.RATE_LIMIT_EXCEEDED]: 429,
        [AuthErrorType.SERVER_ERROR]: 500
      }[authError.type] || 500;
      
      return NextResponse.json(response, { status: statusCode });
    }
    
    // Error no estructurado - log completo y respuesta genérica
    logger.error('Unexpected error in password reset', error, {
      duration,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });
    
    const response: ResetPasswordResponse = {
      success: false,
      message: "Error interno del servidor",
      error: "Error interno del servidor. Intente nuevamente más tarde."
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}