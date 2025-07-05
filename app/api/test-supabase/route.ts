/**
 * API endpoint para probar la conectividad con Supabase
 * Útil para diagnosticar problemas de configuración
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../../lib/logger';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Verificar variables de entorno
    const config = {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlValid: supabaseUrl && supabaseUrl.includes('supabase.co'),
      serviceKeyValid: supabaseServiceKey && supabaseServiceKey.length > 50 && !supabaseServiceKey.includes('ServiceRoleKeyHere')
    };

    logger.info('Supabase configuration check', config);

    if (!config.hasUrl || !config.hasServiceKey) {
      return NextResponse.json({
        success: false,
        message: 'Missing Supabase configuration',
        config
      }, { status: 500 });
    }

    if (!config.urlValid || !config.serviceKeyValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Supabase configuration (using placeholder values)',
        config
      }, { status: 500 });
    }

    // Intentar conectar a Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Probar una consulta simple
    const { data, error, count } = await supabase
      .from('usuarios')
      .select('cedula', { count: 'exact', head: true });

    if (error) {
      logger.error('Supabase connection test failed', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to Supabase',
        error: error.message,
        config
      }, { status: 500 });
    }

    logger.info('Supabase connection test successful', {
      userCount: count
    });

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      userCount: count,
      config
    });

  } catch (error) {
    logger.error('Unexpected error testing Supabase connection', error instanceof Error ? error : undefined);
    
    return NextResponse.json({
      success: false,
      message: 'Unexpected error testing Supabase connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cedula } = await request.json();
    
    if (!cedula) {
      return NextResponse.json({
        success: false,
        message: 'Cédula is required'
      }, { status: 400 });
    }

    // Verificar configuración
    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('ServiceRoleKeyHere')) {
      return NextResponse.json({
        success: false,
        message: 'Supabase not properly configured'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuario específico
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('correo, cedula')
      .eq('cedula', cedula)
      .single();

    logger.info('Supabase user search test', {
      cedula: cedula.substring(0, 4) + '***',
      found: !!user,
      hasEmail: user?.correo ? true : false,
      error: error?.message
    });

    return NextResponse.json({
      success: true,
      found: !!user,
      hasEmail: user?.correo ? true : false,
      error: error?.message,
      user: user ? {
        cedula: user.cedula,
        email: user.correo ? user.correo.substring(0, 3) + '***' + user.correo.substring(user.correo.indexOf('@')) : null
      } : null
    });

  } catch (error) {
    logger.error('Error testing user search in Supabase', error instanceof Error ? error : undefined);
    
    return NextResponse.json({
      success: false,
      message: 'Error testing user search',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}