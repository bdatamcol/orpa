import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock de Supabase client
jest.mock('../app/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('Reset Password Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        href: '',
      },
      writable: true,
    });
  });

  test('should detect expired tokens', () => {
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hora atrás
    window.location.hash = `#access_token=test&type=recovery&expires_at=${expiredTimestamp}`;
    
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const expiresAt = urlParams.get('expires_at');
    const isExpired = expiresAt && new Date(parseInt(expiresAt) * 1000) < new Date();
    
    expect(isExpired).toBe(true);
  });

  test('should detect valid tokens', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hora en el futuro
    window.location.hash = `#access_token=test&type=recovery&expires_at=${futureTimestamp}`;
    
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const expiresAt = urlParams.get('expires_at');
    const isExpired = expiresAt && new Date(parseInt(expiresAt) * 1000) < new Date();
    
    expect(isExpired).toBe(false);
  });

  test('should validate email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@example.org'
    ];
    
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'test@',
      'test..test@example.com'
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  test('should validate cedula format', () => {
    const validCedulas = [
      '12345678',
      '123456789',
      '1234567890'
    ];
    
    const invalidCedulas = [
      '1234567',     // muy corta
      '12345678901', // muy larga
      '12345678a',   // contiene letras
      '123-456-789', // contiene guiones
      ''
    ];
    
    const cedulaRegex = /^[0-9]{8,10}$/;
    
    validCedulas.forEach(cedula => {
      expect(cedulaRegex.test(cedula)).toBe(true);
    });
    
    invalidCedulas.forEach(cedula => {
      expect(cedulaRegex.test(cedula)).toBe(false);
    });
  });

  test('should handle missing recovery type', () => {
    window.location.hash = '#access_token=test&expires_at=123456789';
    
    const hash = window.location.hash;
    const hasRecoveryType = hash.includes('type=recovery');
    
    expect(hasRecoveryType).toBe(false);
  });

  test('should handle missing hash', () => {
    window.location.hash = '';
    
    const hash = window.location.hash;
    const isValidResetLink = hash && hash.includes('type=recovery');
    
    expect(isValidResetLink).toBe(false);
  });
});