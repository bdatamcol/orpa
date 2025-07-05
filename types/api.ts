/**
 * Tipos TypeScript para las respuestas de API y datos de usuario
 */

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

/**
 * Datos de usuario en la base de datos
 */
export interface Usuario {
  cedula: string;
  correo: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  created_at?: string;
  updated_at?: string;
}



/**
 * Configuración de Supabase
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

/**
 * Errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Response con errores de validación
 */
export interface ValidationErrorResponse {
  success: false;
  error: string;
  validationErrors: ValidationError[];
}

/**
 * Tipos de errores de autenticación
 */
export enum AuthErrorType {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_CEDULA = 'INVALID_CEDULA',
  EMAIL_NOT_REGISTERED = 'EMAIL_NOT_REGISTERED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

/**
 * Error de autenticación estructurado
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: string;
  meta?: Record<string, any>;
}