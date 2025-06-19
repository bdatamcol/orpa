/**
 * Sistema de logging estructurado para la aplicación
 */

export interface LogMeta {
  [key: string]: any;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: LogMeta;
  timestamp: string;
  error?: string;
}

class Logger {
  private formatLog(level: LogEntry['level'], message: string, meta?: LogMeta, error?: Error): LogEntry {
    return {
      level,
      message,
      meta,
      timestamp: new Date().toISOString(),
      error: error?.message
    };
  }

  info(message: string, meta?: LogMeta): void {
    const logEntry = this.formatLog('info', message, meta);
    console.log(JSON.stringify(logEntry));
  }

  warn(message: string, meta?: LogMeta): void {
    const logEntry = this.formatLog('warn', message, meta);
    console.warn(JSON.stringify(logEntry));
  }

  error(message: string, error?: Error, meta?: LogMeta): void {
    const logEntry = this.formatLog('error', message, meta, error);
    console.error(JSON.stringify(logEntry));
  }

  debug(message: string, meta?: LogMeta): void {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatLog('debug', message, meta);
      console.debug(JSON.stringify(logEntry));
    }
  }

  /**
   * Log específico para operaciones de autenticación
   */
  auth(operation: string, meta: LogMeta): void {
    this.info(`Auth: ${operation}`, {
      ...meta,
      category: 'authentication'
    });
  }

  /**
   * Log específico para operaciones de base de datos
   */
  database(operation: string, meta: LogMeta): void {
    this.info(`Database: ${operation}`, {
      ...meta,
      category: 'database'
    });
  }
}

export const logger = new Logger();