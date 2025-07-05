import { NextRequest, NextResponse } from 'next/server';
import { localUserService } from '../../../lib/services/localUserService';
import { logger } from '../../../lib/logger';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * API Route para actualizar el correo de un usuario local
 * Útil para cambiar el correo de prueba por uno real
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cedula, email } = body;

    if (!cedula || !email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cédula y correo son requeridos',
          error: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Formato de correo inválido',
          error: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    logger.info('User email update request', {
      cedula: cedula.substring(0, 4) + '***',
      newEmail: email.substring(0, 3) + '***',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Verificar si el usuario existe
    const existingUser = localUserService.findUserByCedula(cedula);
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Actualizar el usuario en memoria
    const updatedUser = {
      ...existingUser,
      email: email
    };

    // Actualizar el archivo users.json si existe
    try {
      const usersPath = join(process.cwd(), 'lib', 'data', 'users.json');
      
      // Crear la estructura de datos actualizada
      const usersData = {
        users: {
          [cedula]: updatedUser,
          // Mantener otros usuarios por defecto
          '1234567890': {
            cedula: '1234567890',
            email: 'test@orpainversiones.com',
            nombre: 'Test',
            apellido: 'User'
          }
        }
      };

      // Escribir el archivo actualizado
      writeFileSync(usersPath, JSON.stringify(usersData, null, 2), 'utf8');
      
      logger.info('User email updated successfully', {
        cedula: cedula.substring(0, 4) + '***',
        oldEmail: existingUser.email.substring(0, 3) + '***',
        newEmail: email.substring(0, 3) + '***'
      });

      return NextResponse.json({
        success: true,
        message: 'Correo actualizado exitosamente',
        user: {
          cedula: updatedUser.cedula,
          email: updatedUser.email,
          nombre: updatedUser.nombre,
          apellido: updatedUser.apellido
        }
      });

    } catch (fileError: any) {
      logger.warn('Could not update users.json file, user updated in memory only', {
        error: fileError.message
      });

      return NextResponse.json({
        success: true,
        message: 'Correo actualizado en memoria (archivo no disponible)',
        user: {
          cedula: updatedUser.cedula,
          email: updatedUser.email,
          nombre: updatedUser.nombre,
          apellido: updatedUser.apellido
        },
        warning: 'Los cambios se perderán al reiniciar el servidor'
      });
    }
    
  } catch (error: any) {
    logger.error('Failed to update user email', error, {
      errorMessage: error.message
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para obtener información del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cedula = url.searchParams.get('cedula');

    if (!cedula) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cédula es requerida',
          error: 'MISSING_CEDULA'
        },
        { status: 400 }
      );
    }

    const user = localUserService.findUserByCedula(cedula);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        cedula: user.cedula,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido
      }
    });
    
  } catch (error: any) {
    logger.error('Failed to get user info', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}