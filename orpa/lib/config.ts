/**
 * Configuración centralizada de la aplicación
 * Maneja variables de entorno y configuraciones por ambiente
 */

export interface AppConfig {
  siteUrl: string;
  supabase: {
    url: string;
    anonKey: string;
    serviceKey?: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Valida que las variables de entorno requeridas estén presentes
 */
function validateEnvironment(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
}

/**
 * Obtiene la configuración de la aplicación
 */
export function getConfig(): AppConfig {
  validateEnvironment();
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    isDevelopment,
    isProduction
  };
}

/**
 * Configuración por defecto para desarrollo
 */
export const defaultConfig = {
  development: {
    siteUrl: 'http://localhost:3000'
  },
  production: {
    siteUrl: 'https://micuenta.orpainversiones.com'
  }
};