/**
 * Servicio local de usuarios
 * Maneja la búsqueda de usuarios desde un archivo JSON local
 * Alternativa temporal a la base de datos de Supabase
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../logger';

export interface LocalUser {
  cedula: string;
  email: string;
  nombre: string;
  apellido: string;
}

export class LocalUserService {
  private users: Map<string, LocalUser> = new Map();

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    try {
      const usersPath = join(process.cwd(), 'lib', 'data', 'users.json');
      const usersData = JSON.parse(readFileSync(usersPath, 'utf8'));
      
      Object.values(usersData.users).forEach((user: any) => {
        this.users.set(user.cedula, user as LocalUser);
      });
      
      logger.info('Local users loaded successfully', {
        userCount: this.users.size
      });
    } catch (error: any) {
      logger.error('Failed to load local users', error, {
        errorMessage: error.message
      });
      
      // Cargar usuarios por defecto si falla la carga del archivo
      this.loadDefaultUsers();
    }
  }

  private loadDefaultUsers(): void {
    const defaultUsers: LocalUser[] = [
      {
        cedula: '1090178379',
        email: 'usuario@orpainversiones.com',
        nombre: 'Usuario',
        apellido: 'Prueba'
      },
      {
        cedula: '1234567890',
        email: 'test@orpainversiones.com',
        nombre: 'Test',
        apellido: 'User'
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.cedula, user);
    });

    logger.info('Default users loaded', {
      userCount: this.users.size
    });
  }

  /**
   * Busca un usuario por cédula
   */
  findUserByCedula(cedula: string): LocalUser | null {
    const user = this.users.get(cedula.trim());
    
    if (user) {
      logger.info('Local user found', {
        cedula: cedula.substring(0, 4) + '***',
        email: user.email.substring(0, 3) + '***'
      });
    } else {
      logger.warn('Local user not found', {
        cedula: cedula.substring(0, 4) + '***'
      });
    }
    
    return user || null;
  }

  /**
   * Obtiene todos los usuarios (para administración)
   */
  getAllUsers(): LocalUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Verifica si existe un usuario con la cédula dada
   */
  userExists(cedula: string): boolean {
    return this.users.has(cedula.trim());
  }
}

// Instancia singleton
export const localUserService = new LocalUserService();