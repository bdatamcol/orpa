import { NextRequest, NextResponse } from 'next/server';
import { directEmailService } from '../../../lib/services/directEmailService';
import { logger } from '../../../lib/logger';

/**
 * API Route para probar la configuración SMTP
 * Útil para diagnosticar problemas de entrega de correos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, testType = 'connection' } = body;

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email es requerido para la prueba',
          error: 'MISSING_EMAIL'
        },
        { status: 400 }
      );
    }

    logger.info('SMTP test initiated', {
      email: email.substring(0, 3) + '***',
      testType,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    let result;
    let message;

    switch (testType) {
      case 'connection':
        result = await directEmailService.testConnection();
        message = result ? 'Conexión SMTP exitosa' : 'Fallo en la conexión SMTP';
        break;
        
      case 'send':
        result = await directEmailService.sendTestEmail(email);
        message = result ? 'Email de prueba enviado exitosamente' : 'Fallo al enviar email de prueba';
        break;
        
      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Tipo de prueba no válido. Use "connection" o "send"',
            error: 'INVALID_TEST_TYPE'
          },
          { status: 400 }
        );
    }

    const response = {
      success: result,
      message,
      testType,
      timestamp: new Date().toISOString(),
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER?.substring(0, 3) + '***',
        from: process.env.SMTP_FROM
      }
    };

    logger.info('SMTP test completed', {
      success: result,
      testType,
      email: email.substring(0, 3) + '***'
    });

    return NextResponse.json(response, { status: result ? 200 : 500 });
    
  } catch (error: any) {
    logger.error('SMTP test failed', error, {
      errorMessage: error.message,
      errorStack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno durante la prueba SMTP',
        error: 'INTERNAL_SERVER_ERROR',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para obtener información de configuración SMTP
 */
export async function GET() {
  try {
    const config = {
      host: process.env.SMTP_HOST || 'No configurado',
      port: process.env.SMTP_PORT || 'No configurado',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'No configurado',
      from: process.env.SMTP_FROM || 'No configurado',
      hasPassword: !!process.env.SMTP_PASS
    };

    return NextResponse.json({
      success: true,
      message: 'Configuración SMTP actual',
      config
    });
    
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener configuración SMTP',
        error: error.message
      },
      { status: 500 }
    );
  }
}