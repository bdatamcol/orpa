import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { logger } from '../../../lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET /api/diagnose-resend
 * Verifica la configuración de Resend
 */
export async function GET() {
  try {
    const diagnostics: any = {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyFormat: process.env.RESEND_API_KEY ? 
        (process.env.RESEND_API_KEY.startsWith('re_') ? 'Válido' : 'Formato inválido') : 
        'No configurado',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'No configurado',
      environment: process.env.NODE_ENV || 'unknown',
      domains: []
    };

    // Verificar si la API key funciona
    let resendStatus = 'No probado';
    let resendError = null;
    
    if (process.env.RESEND_API_KEY) {
      try {
        // Intentar obtener información de la cuenta
        const domains = await resend.domains.list();
        resendStatus = 'Conexión exitosa';
        diagnostics.domains = Array.isArray(domains.data) ? domains.data.map((d: any) => ({
          name: d.name,
          status: d.status,
          region: d.region
        })) : [];
      } catch (error: any) {
        resendStatus = 'Error de conexión';
        resendError = error.message;
        logger.error('Resend API error during diagnostics', error);
      }
    }

    const allGood = diagnostics.hasApiKey && 
                   diagnostics.apiKeyFormat === 'Válido' && 
                   resendStatus === 'Conexión exitosa';

    return NextResponse.json({
      success: allGood,
      message: allGood ? 
        'Configuración de Resend correcta' : 
        'Se encontraron problemas en la configuración',
      details: {
        ...diagnostics,
        resendStatus,
        resendError
      }
    });

  } catch (error) {
    logger.error('Diagnostics failed', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al ejecutar diagnósticos',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diagnose-resend
 * Envía un email de prueba
 */
export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: 'Email de prueba es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { success: false, message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'RESEND_API_KEY no está configurado',
          details: {
            solution: 'Configura la variable RESEND_API_KEY en tu archivo .env.local'
          }
        },
        { status: 500 }
      );
    }

    logger.info('Sending test email via Resend', { testEmail: testEmail.substring(0, 3) + '***' });

    // Enviar email de prueba
    const emailResult = await resend.emails.send({
      from: 'ORPA Test <noreply@orpainversiones.com>',
      to: [testEmail],
      subject: '🧪 Email de Prueba - ORPA Inversiones',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email de Prueba</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🧪 Email de Prueba</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">¡Configuración exitosa!</h2>
            
            <p>Si estás leyendo este mensaje, significa que:</p>
            
            <ul style="color: #059669; font-weight: 500;">
              <li>✅ Tu API Key de Resend está configurada correctamente</li>
              <li>✅ Los emails se están enviando exitosamente</li>
              <li>✅ La configuración del dominio funciona</li>
            </ul>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">📧 Detalles del envío</h3>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Enviado a:</strong> ${testEmail}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Servicio:</strong> Resend API</p>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              <strong>Nota:</strong> Si este email llegó a tu carpeta de spam, considera configurar los registros SPF, DKIM y DMARC para tu dominio.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Este es un email de prueba generado automáticamente por ORPA Inversiones.
            </p>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Test email sent successfully via Resend', { 
      emailId: emailResult.data?.id,
      testEmail: testEmail.substring(0, 3) + '***'
    });

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado exitosamente a ${testEmail}`,
      details: {
        emailId: emailResult.data?.id,
        timestamp: new Date().toISOString(),
        provider: 'Resend',
        note: 'Revisa tu bandeja de entrada y carpeta de spam. El email puede tardar unos minutos en llegar.'
      }
    });

  } catch (error: any) {
    logger.error('Test email failed', error instanceof Error ? error : new Error(String(error)));
    
    // Analizar el tipo de error para dar mejor feedback
    let errorMessage = 'Error al enviar email de prueba';
    let solution = 'Verifica tu configuración de Resend';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API Key de Resend inválida';
      solution = 'Verifica que tu RESEND_API_KEY sea correcta y esté activa';
    } else if (error.message?.includes('domain')) {
      errorMessage = 'Problema con el dominio';
      solution = 'Verifica tu dominio en el dashboard de Resend o usa el dominio sandbox';
    } else if (error.message?.includes('rate')) {
      errorMessage = 'Límite de envío excedido';
      solution = 'Has alcanzado el límite de tu plan de Resend';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error.message,
        details: {
          solution,
          errorType: error.name || 'Unknown',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}