/**
 * Middleware de rate limiting para prevenir abuso de endpoints
 */

import { NextRequest } from 'next/server';
import { logger } from '../logger';
import { AuthError, AuthErrorType } from '../../types/api';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstAttempt: number;
}

/**
 * Almacén en memoria para rate limiting
 * En producción se debería usar Redis o similar
 */
const attempts = new Map<string, RateLimitEntry>();

/**
 * Configuración de rate limiting
 */
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

/**
 * Configuraciones predefinidas
 */
export const rateLimitConfigs = {
  // Para endpoints de autenticación (más restrictivo)
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    skipSuccessfulRequests: true
  },
  // Para endpoints generales
  general: {
    maxAttempts: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
    skipSuccessfulRequests: false
  }
};

/**
 * Obtiene la IP del cliente
 */
function getClientIP(req: NextRequest): string {
  // Intentar obtener la IP real del cliente
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Limpia entradas expiradas del almacén
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of attempts.entries()) {
    if (now > entry.resetTime) {
      attempts.delete(key);
    }
  }
}

/**
 * Verifica si una request está dentro de los límites de rate limiting
 */
export function checkRateLimit(
  req: NextRequest, 
  config: RateLimitConfig = rateLimitConfigs.general
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(req);
  const now = Date.now();
  const key = `${ip}:${req.nextUrl.pathname}`;
  
  // Limpiar entradas expiradas periódicamente
  if (Math.random() < 0.1) { // 10% de probabilidad
    cleanupExpiredEntries();
  }
  
  const entry = attempts.get(key);
  
  // Si no hay entrada o ha expirado, crear nueva
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      firstAttempt: now
    };
    attempts.set(key, newEntry);
    
    logger.debug('Rate limit: New entry created', {
      ip,
      path: req.nextUrl.pathname,
      remaining: config.maxAttempts - 1
    });
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: newEntry.resetTime
    };
  }
  
  // Verificar si se ha excedido el límite
  if (entry.count >= config.maxAttempts) {
    logger.warn('Rate limit exceeded', {
      ip,
      path: req.nextUrl.pathname,
      attempts: entry.count,
      maxAttempts: config.maxAttempts,
      windowMs: config.windowMs
    });
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Incrementar contador
  entry.count++;
  
  logger.debug('Rate limit: Request counted', {
    ip,
    path: req.nextUrl.pathname,
    count: entry.count,
    remaining: config.maxAttempts - entry.count
  });
  
  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Middleware para aplicar rate limiting a una request
 */
export function applyRateLimit(
  req: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.general
): void {
  const result = checkRateLimit(req, config);
  
  if (!result.allowed) {
    const error: AuthError = {
      type: AuthErrorType.RATE_LIMIT_EXCEEDED,
      message: 'Demasiados intentos. Intente nuevamente más tarde.',
      details: `Límite: ${config.maxAttempts} requests por ${config.windowMs / 1000 / 60} minutos`,
      meta: {
        resetTime: result.resetTime,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      }
    };
    throw error;
  }
}

/**
 * Marca una request como exitosa (para skipSuccessfulRequests)
 */
export function markRequestAsSuccessful(
  req: NextRequest,
  config: RateLimitConfig
): void {
  if (!config.skipSuccessfulRequests) return;
  
  const ip = getClientIP(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  const entry = attempts.get(key);
  
  if (entry && entry.count > 0) {
    entry.count--;
    logger.debug('Rate limit: Successful request, count decremented', {
      ip,
      path: req.nextUrl.pathname,
      newCount: entry.count
    });
  }
}

/**
 * Obtiene estadísticas de rate limiting para una IP
 */
export function getRateLimitStats(req: NextRequest): {
  attempts: number;
  remaining: number;
  resetTime: number;
} | null {
  const ip = getClientIP(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  const entry = attempts.get(key);
  
  if (!entry) return null;
  
  return {
    attempts: entry.count,
    remaining: Math.max(0, rateLimitConfigs.auth.maxAttempts - entry.count),
    resetTime: entry.resetTime
  };
}