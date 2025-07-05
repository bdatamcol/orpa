/**
 * API endpoint para envío de emails de recuperación usando Resend
 * Alternativa moderna y confiable al SMTP tradicional
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resendEmailService } from '../../../lib/services/resendEmailService';
import { logger } from '../../../lib/logger';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { cedula } = await request.json();
    
    // Validar entrada
    if (!cedula || typeof cedula !== 'string' || cedula.trim().length === 0) {
      logger.warn('Invalid cedula provided to resend email endpoint');
      return NextResponse.json(
        { error: 'Cédula es requerida' },
        { status: 400 }
      );
    }

    const cleanCedula = cedula.trim();
    
    // Obtener IP del cliente para rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    logger.info(`Password reset request via Resend`, {
      cedula: cleanCedula.replace(/(.{2}).*(.{2})/, '$1***$2'),
      ip: clientIP,
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    });

    // Buscar usuario por cédula
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('correo, cedula')
      .eq('cedula', cleanCedula)
      .single();

    if (userError || !user) {
      logger.warn(`User not found for cedula: ${cleanCedula.replace(/(.{2}).*(.{2})/, '$1***$2')}`);
      
      // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
      return NextResponse.json({
        success: true,
        message: 'Si existe una cuenta con esa cédula, recibirás un email con las instrucciones.'
      });
    }

    // Validar que el usuario tenga email
    if (!user.correo) {
      logger.warn(`User found but no email for cedula: ${cleanCedula.replace(/(.{2}).*(.{2})/, '$1***$2')}`);
      return NextResponse.json({
        success: true,
        message: 'Si existe una cuenta con esa cédula, recibirás un email con las instrucciones.'
      });
    }

    // Enviar email usando Resend
    const emailResult = await resendEmailService.sendPasswordResetEmail(
      user.correo,
      cleanCedula,
      clientIP
    );

    if (!emailResult.success) {
      logger.error('Failed to send password reset email via Resend', {
        error: emailResult.message,
        cedula: cleanCedula.replace(/(.{2}).*(.{2})/, '$1***$2'),
        email: user.correo.replace(/(.{2}).*(@.*)/, '$1***$2')
      });

      return NextResponse.json(
        { error: emailResult.message || 'Error al enviar el email' },
        { status: 500 }
      );
    }

    logger.info('Password reset email sent successfully via Resend', {
      cedula: cleanCedula.replace(/(.{2}).*(.{2})/, '$1***$2'),
      email: user.correo.replace(/(.{2}).*(@.*)/, '$1***$2'),
      expiresAt: emailResult.expiresAt,
      service: 'Resend'
    });

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente. Revisa tu bandeja de entrada.',
      expiresAt: emailResult.expiresAt,
      service: 'Resend'
    });

  } catch (error) {
    logger.error('Unexpected error in resend email endpoint:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener estadísticas (solo para desarrollo)
export async function GET(request: NextRequest) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      );
    }

    const stats = resendEmailService.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting resend service stats:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}