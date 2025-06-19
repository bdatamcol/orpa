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
      this.config.supabase.serviceKey !== 'tu_service_role_key_aqui';
    
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
   * Envía un email de restablecimiento de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const redirectUrl = `${this.config.siteUrl}/auth/reset-password`;
    
    logger.auth('Sending password reset email', {
      email: email.substring(0, 3) + '***',
      redirectUrl
    });

    const { data, error: resetError } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (resetError) {
      logger.error('Password reset email failed', resetError, {
        email: email.substring(0, 3) + '***',
        redirectUrl
      });

      // Mapear diferentes tipos de errores de Supabase
      if (resetError.message.includes('User not found') || 
          resetError.message.includes('Invalid email') ||
          resetError.message.includes('Unable to validate email address')) {
        const error: AuthError = {
          type: AuthErrorType.EMAIL_NOT_REGISTERED,
          message: 'El correo no está registrado en el sistema de autenticación',
          details: resetError.message
        };
        throw error;
      }

      if (resetError.message.includes('permission') || resetError.message.includes('unauthorized')) {
        const error: AuthError = {
          type: AuthErrorType.PERMISSION_DENIED,
          message: 'Error de configuración del servidor. Contacte al administrador.',
          details: resetError.message
        };
        throw error;
      }

      const error: AuthError = {
        type: AuthErrorType.SERVER_ERROR,
        message: 'Error al enviar el correo de recuperación',
        details: resetError.message
      };
      throw error;
    }

    logger.auth('Password reset email sent successfully', {
      email: email.substring(0, 3) + '***',
      redirectUrl
    });
  }

  /**
   * Proceso completo de restablecimiento de contraseña por cédula
   */
  async resetPasswordByCedula(cedula: string): Promise<void> {
    const user = await this.findUserByCedula(cedula);
    await this.sendPasswordResetEmail(user.correo);
  }
}