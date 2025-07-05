import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { directEmailService } from '../../../lib/services/directEmailService';
import { localUserService } from '../../../lib/services/localUserService';
import { logger } from '../../../lib/logger';
import { applyRateLimit, markRequestAsSuccessful, rateLimitConfigs } from '../../../lib/middleware/rateLimit';
import { ResetPasswordRequest, ResetPasswordResponse } from '../../../types/api';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Buscar usuario primero en el servicio local
    let user = localUserService.findUserByCedula(cedula);
    let userSource = 'local';
    
    // Si no se encuentra en local, buscar en Supabase
    if (!user) {
      try {
        const { data: supabaseUser, error: userError } = await supabase
          .from('usuarios')
          .select('correo, cedula')
          .eq('cedula', cedula)
          .single();
        
        if (!userError && supabaseUser && supabaseUser.correo) {
          user = {
            id: supabaseUser.cedula,
            cedula: supabaseUser.cedula,
            email: supabaseUser.correo,
            name: 'Usuario Supabase'
          };
          userSource = 'supabase';
          
          logger.info('User found in Supabase', {
            cedula: cedula.substring(0, 4) + '***',
            email: supabaseUser.correo.substring(0, 3) + '***',
            source: 'supabase'
          });
        }
      } catch (supabaseError) {
        logger.warn('Error searching user in Supabase', {
          cedula: cedula.substring(0, 4) + '***',
          error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
        });
      }
    } else {
      logger.info('User found in local service', {
        cedula: cedula.substring(0, 4) + '***',
        email: user.email.substring(0, 3) + '***',
        source: 'local'
      });
    }
    
    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      logger.warn('Password reset attempted for non-existent user', {
        cedula: cedula.substring(0, 4) + '***',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
      
      // Retornamos éxito para no revelar información
      const response: ResetPasswordResponse = {
        success: true,
        message: 'Si existe una cuenta asociada a esta cédula, se ha enviado un enlace de recuperación al correo registrado. Revisa tu bandeja de entrada y spam.',
        details: 'El enlace expira en 24 horas'
      };
      
      return NextResponse.json(response, { status: 200 });
    }
    
    // Enviar email directamente usando nuestro servicio
    const { token, expiresAt } = await directEmailService.sendPasswordResetEmail(user.email, cedula);
    
    // Marcar como exitoso para rate limiting
    markRequestAsSuccessful(request, rateLimitConfigs.auth);
    
    const duration = Date.now() - startTime;
    
    logger.info('Direct password reset email sent successfully', {
      cedula: cedula.substring(0, 4) + '***',
      email: user.email.substring(0, 3) + '***',
      duration,
      expiresAt,
      tokenLength: token.length,
      userSource
    });

    const response: ResetPasswordResponse = {
      success: true,
      message: 'Si existe una cuenta asociada a esta cédula, se ha enviado un enlace de recuperación al correo registrado. Revisa tu bandeja de entrada y spam.',
      details: `El enlace expira en 24 horas (${expiresAt.toLocaleString('es-EC')})`
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