/**
 * Servicio de autenticación
 * Maneja todas las operaciones relacionadas con autenticación de usuarios
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Usuario, AuthError, AuthErrorType } from '../../types/api';
import { logger } from '../logger';
import { getConfig } from '../config';

export class AuthService {
  private supabase: SupabaseClient;
  private config: ReturnType<typeof getConfig>;

  constructor() {
    this.config = getConfig();
    
    // Usar service key si está disponible, sino usar anon key
    const isServiceKeyConfigured = this.config.supabase.serviceKey && 
      this.config.supabase.serviceKey.trim() !== '';
    
    const supabaseKey = isServiceKeyConfigured 
      ? this.config.supabase.serviceKey! 
      : this.config.supabase.anonKey;
    
    this.supabase = createClient(this.config.supabase.url, supabaseKey);
    
    logger.debug('AuthService initialized', {
      hasServiceKey: isServiceKeyConfigured,
      supabaseUrl: this.config.supabase.url
    });
  }

  /**
   * Valida el formato de una cédula
   */
  private validateCedula(cedula: string): boolean {
    const cedulaRegex = /^[0-9]{8,10}$/;
    return cedulaRegex.test(cedula.trim());
  }

  /**
   * Valida el formato de un email
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Busca un usuario por su cédula
   */
  async findUserByCedula(cedula: string): Promise<Usuario> {
    const cedulaString = cedula.toString().trim();
    
    if (!this.validateCedula(cedulaString)) {
      const error: AuthError = {
        type: AuthErrorType.INVALID_CEDULA,
        message: 'Formato de cédula inválido. Debe contener entre 8 y 10 dígitos.',
        details: `Cédula recibida: ${cedulaString}`
      };
      throw error;
    }

    logger.database('Searching user by cedula', { cedula: cedulaString });

    const { data: user, error: userError } = await this.supabase
      .from('usuarios')
      .select('cedula, correo, nombre1, apellido1')
      .eq('cedula', cedulaString)
      .single();

    if (userError || !user) {
      const error: AuthError = {
        type: AuthErrorType.USER_NOT_FOUND,
        message: 'No se encontró ninguna cuenta con esta cédula',
        details: userError?.message,
        meta: { cedula: cedulaString }
      };
      logger.warn('User not found', { cedula: cedulaString, error: userError?.message });
      throw error;
    }

    if (!this.validateEmail(user.correo)) {
      const error: AuthError = {
        type: AuthErrorType.INVALID_EMAIL,
        message: 'El correo asociado no tiene un formato válido',
        details: `Email: ${user.correo}`,
        meta: { cedula: cedulaString, email: user.correo }
      };
      logger.warn('Invalid email format', { cedula: cedulaString, email: user.correo });
      throw error;
    }

    logger.database('User found successfully', { 
      cedula: cedulaString, 
      email: user.correo.substring(0, 3) + '***' // Log parcial del email por seguridad
    });

    return user;
  }

  /**
   * Actualiza la contraseña de un usuario por su cédula
   */
  async updatePasswordByCedula(cedula: string, newPassword: string): Promise<void> {
    const cedulaString = cedula.toString().trim();
    
    if (!this.validateCedula(cedulaString)) {
      const error: AuthError = {
        type: AuthErrorType.INVALID_CEDULA,
        message: 'Formato de cédula inválido. Debe contener entre 8 y 10 dígitos.',
        details: `Cédula recibida: ${cedulaString}`
      };
      throw error;
    }

    if (!newPassword || newPassword.length < 6) {
      const error: AuthError = {
        type: AuthErrorType.INVALID_PASSWORD,
        message: 'La contraseña debe tener al menos 6 caracteres',
        details: `Password length: ${newPassword?.length || 0}`
      };
      throw error;
    }

    logger.database('Updating password for user', { cedula: cedulaString });

    // Primero verificar que el usuario existe
    const user = await this.findUserByCedula(cedulaString);

    // Buscar el usuario en Supabase Auth por email
    logger.debug('Searching for user in Supabase Auth', { cedula: cedulaString, email: user.correo });
    
    let authUser = null;
    let page = 1;
    let allUsersFetched = false;

    while (!authUser && !allUsersFetched) {
      const { data: authUsers, error: listError } = await this.supabase.auth.admin.listUsers({ page, perPage: 50 });

      if (listError) {
        const error: AuthError = {
          type: AuthErrorType.DATABASE_ERROR,
          message: 'Error al buscar usuarios en autenticación',
          details: listError.message,
          meta: { cedula: cedulaString }
        };
        logger.error('Failed to list users', { error: listError });
        throw error;
      }

      if (authUsers.users.length === 0) {
        allUsersFetched = true;
        break;
      }

      logger.debug('Fetched a page of auth users', { 
        cedula: cedulaString, 
        page: page,
        count: authUsers.users.length
      });

      authUser = authUsers.users.find(u => u.email?.toLowerCase() === user.correo.toLowerCase());
      page++;
    }
    
    if (authUser) {
        logger.info('User found in Supabase Auth, updating password', { 
          cedula: cedulaString, 
          userId: authUser.id 
        });
        
        // Actualizar la contraseña del usuario existente
        const { error: updateError } = await this.supabase.auth.admin.updateUserById(
          authUser.id,
          { password: newPassword }
        );
        
        if (updateError) {
          const error: AuthError = {
            type: AuthErrorType.DATABASE_ERROR,
            message: 'Error al actualizar la contraseña',
            details: updateError.message,
            meta: { cedula: cedulaString, userId: authUser.id }
          };
          logger.error('Password update failed for existing user', { 
            cedula: cedulaString, 
            userId: authUser.id,
            error: updateError.message,
            errorCode: updateError.code,
            fullError: updateError
          });
          throw error;
        }
        
        logger.info('Password updated successfully for existing user', { cedula: cedulaString, userId: authUser.id });
        return;
    } else {
      // Si el usuario no existe en Supabase Auth, intentar crearlo
      logger.info('User not found in Supabase Auth, attempting to create', { cedula: cedulaString, email: user.correo });
      
      const { data: newAuthUser, error: createError } = await this.supabase.auth.admin.createUser({
        email: user.correo,
        password: newPassword,
        email_confirm: true
      });
      
      if (createError) {
        const error: AuthError = {
          type: AuthErrorType.DATABASE_ERROR,
          message: 'Error al crear usuario en el sistema de autenticación',
          details: createError.message,
          meta: { cedula: cedulaString, email: user.correo }
        };
        logger.error('Failed to create auth user', { 
          cedula: cedulaString, 
          email: user.correo, 
          error: createError.message,
          errorCode: createError.code,
          fullError: createError
        });
        throw error;
      }
      
      logger.info('Auth user created successfully', { cedula: cedulaString, email: user.correo, userId: newAuthUser.user.id });
      return; // Password ya fue establecida durante la creación
    }

    logger.debug('Auth user found', { cedula: cedulaString, userId: authUser.id });

    // Actualizar la contraseña usando el ID correcto del usuario
    const { error: updateError } = await this.supabase.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) {
      const error: AuthError = {
        type: AuthErrorType.DATABASE_ERROR,
        message: 'Error al actualizar la contraseña',
        details: updateError.message,
        meta: { cedula: cedulaString, userId: authUser.id, updateError: updateError }
      };
      logger.error('Password update failed', { 
        cedula: cedulaString, 
        userId: authUser.id,
        error: updateError.message,
        errorCode: updateError.code,
        fullError: updateError
      });
      throw error;
    }

    logger.info('Password updated successfully', { cedula: cedulaString });
  }

}