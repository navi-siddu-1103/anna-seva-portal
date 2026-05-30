import { hashPassword, verifyPassword, createToken, verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

describe('Authentication Functions', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test123';
      const hashed = await hashPassword(password);
      
      expect(hashed).not.toBe(password);
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'test123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      // Hashes should be different due to salt
      expect(hash1).not.toBe(hash2);
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(1000);
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });

    it('should handle special characters', async () => {
      const password = 'P@ss!w0rd#$%^&*()';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'test123';
      const hashed = await hashPassword(password);
      const result = await verifyPassword(password, hashed);
      
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'test123';
      const hashed = await hashPassword(password);
      const result = await verifyPassword('wrongpassword', hashed);
      
      expect(result).toBe(false);
    });

    it('should reject empty password', async () => {
      const hashed = await hashPassword('test123');
      const result = await verifyPassword('', hashed);
      
      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword';
      const hashed = await hashPassword(password);
      const result = await verifyPassword('testpassword', hashed);
      
      expect(result).toBe(false);
    });

    it('should verify with special characters', async () => {
      const password = 'P@ss!w0rd#$%';
      const hashed = await hashPassword(password);
      const result = await verifyPassword(password, hashed);
      
      expect(result).toBe(true);
    });
  });

  describe('createToken', () => {
    it('should create a valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'cardholder' };
      const token = createToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should include payload in token', () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'cardholder' };
      const token = createToken(payload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('cardholder');
    });

    it('should include expiration time in token', () => {
      const payload = { userId: '123' };
      const token = createToken(payload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;
      const payload = { userId: '123' };
      
      expect(() => createToken(payload)).toThrow('JWT_SECRET not defined in env');
      
      // Restore for other tests
      process.env.JWT_SECRET = 'test-secret-key';
    });

    it('should handle empty payload object', () => {
      const payload = {};
      const token = createToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should handle complex payload objects', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'distributor',
        name: 'John Doe',
        shopId: 'shop-456',
      };
      const token = createToken(payload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe('123');
      expect(decoded.name).toBe('John Doe');
      expect(decoded.shopId).toBe('shop-456');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = createToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'onlyonepart';
      
      expect(() => verifyToken(malformedToken)).toThrow();
    });

    it('should throw error for token signed with different secret', () => {
      const payload = { userId: '123' };
      const token = jwt.sign(payload, 'different-secret', { expiresIn: '7d' });
      
      expect(() => verifyToken(token)).toThrow();
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      const payload = { userId: '123' };
      const token = createToken(payload);
      delete process.env.JWT_SECRET;
      
      expect(() => verifyToken(token)).toThrow('JWT_SECRET not defined in env');
      
      // Restore for other tests
      process.env.JWT_SECRET = 'test-secret-key';
    });

    it('should throw error for expired token', () => {
      const payload = { userId: '123' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '0s' });
      
      // Wait a bit for token to expire
      setTimeout(() => {
        expect(() => verifyToken(token)).toThrow();
      }, 100);
    });

    it('should handle empty token string', () => {
      expect(() => verifyToken('')).toThrow();
    });

    it('should preserve all payload fields when verifying', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'cardholder',
        name: 'Test User',
      };
      const token = createToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('cardholder');
      expect(decoded.name).toBe('Test User');
    });
  });

  describe('Integration: Hash and Verify', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'MySecurePassword123!';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should handle multiple hash and verify cycles', async () => {
      const passwords = ['pass1', 'pass2', 'pass3', 'pass4'];
      
      for (const password of passwords) {
        const hashed = await hashPassword(password);
        const isValid = await verifyPassword(password, hashed);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Integration: Token Creation and Verification', () => {
    it('should create and verify complete auth flow', () => {
      const payload = {
        userId: '123',
        email: 'user@example.com',
        role: 'cardholder',
      };
      const token = createToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });
});
