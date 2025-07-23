import { describe, it, expect } from 'vitest';
import {
  generateFrontendInviteCode,
  extractVaultIdFromInviteCode,
  parseInviteCode,
  isValidInviteCodeFormat,
  generateShareUrl,
  generateCompleteShareData,
} from '../inviteCodeUtils';

describe('inviteCodeUtils', () => {
  describe('generateFrontendInviteCode', () => {
    it('should generate invite code with correct format', () => {
      const vaultId = BigInt(123);
      const inviteCode = generateFrontendInviteCode(vaultId);
      
      expect(inviteCode).toMatch(/^GOAL123[A-Z0-9]{8}$/);
      expect(inviteCode.startsWith('GOAL123')).toBe(true);
      expect(inviteCode.length).toBeGreaterThan(11);
    });

    it('should generate different codes for same vault ID', () => {
      const vaultId = BigInt(456);
      const code1 = generateFrontendInviteCode(vaultId);
      const code2 = generateFrontendInviteCode(vaultId);
      
      expect(code1).not.toBe(code2);
      expect(code1.startsWith('GOAL456')).toBe(true);
      expect(code2.startsWith('GOAL456')).toBe(true);
    });
  });

  describe('extractVaultIdFromInviteCode', () => {
    it('should extract vault ID from valid invite code', () => {
      const vaultId = BigInt(789);
      const inviteCode = generateFrontendInviteCode(vaultId);
      const extractedId = extractVaultIdFromInviteCode(inviteCode);
      
      expect(extractedId).toBe(vaultId);
    });

    it('should return null for invalid invite codes', () => {
      expect(extractVaultIdFromInviteCode('INVALID')).toBe(null);
      expect(extractVaultIdFromInviteCode('GOAL')).toBe(null);
      expect(extractVaultIdFromInviteCode('GOALXYZ')).toBe(null);
      expect(extractVaultIdFromInviteCode('')).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(extractVaultIdFromInviteCode('GOAL0ABC123')).toBe(BigInt(0));
      expect(extractVaultIdFromInviteCode('GOAL999999ABC123')).toBe(BigInt(999999));
    });
  });

  describe('parseInviteCode', () => {
    it('should parse invite code components', () => {
      const vaultId = BigInt(555);
      const inviteCode = generateFrontendInviteCode(vaultId);
      const components = parseInviteCode(inviteCode);
      
      expect(components).not.toBe(null);
      expect(components!.vaultId).toBe(vaultId);
      expect(typeof components!.timestamp).toBe('number');
      expect(typeof components!.randomSuffix).toBe('string');
      expect(components!.randomSuffix.length).toBeGreaterThan(0);
    });

    it('should return null for invalid codes', () => {
      expect(parseInviteCode('INVALID')).toBe(null);
      expect(parseInviteCode('GOAL')).toBe(null);
      expect(parseInviteCode('')).toBe(null);
    });
  });

  describe('isValidInviteCodeFormat', () => {
    it('should validate correct invite code format', () => {
      const vaultId = BigInt(777);
      const inviteCode = generateFrontendInviteCode(vaultId);
      
      expect(isValidInviteCodeFormat(inviteCode)).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidInviteCodeFormat('INVALID')).toBe(false);
      expect(isValidInviteCodeFormat('GOAL')).toBe(false);
      expect(isValidInviteCodeFormat('GOALXYZ')).toBe(false);
      expect(isValidInviteCodeFormat('')).toBe(false);
    });
  });

  describe('generateShareUrl', () => {
    it('should generate correct share URL', () => {
      const vaultId = BigInt(888);
      const inviteCode = 'GOAL888ABC123XYZ';
      const baseUrl = 'https://example.com';
      
      const shareUrl = generateShareUrl(vaultId, inviteCode, baseUrl);
      
      expect(shareUrl).toBe('https://example.com/join/888?invite=GOAL888ABC123XYZ');
    });

    it('should use window.location.origin when no baseUrl provided', () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://goalfi.com' },
        writable: true,
      });

      const vaultId = BigInt(999);
      const inviteCode = 'GOAL999ABC123XYZ';
      
      const shareUrl = generateShareUrl(vaultId, inviteCode);
      
      expect(shareUrl).toBe('https://goalfi.com/join/999?invite=GOAL999ABC123XYZ');
    });
  });

  describe('generateCompleteShareData', () => {
    it('should generate complete share data', () => {
      const vaultId = BigInt(111);
      const baseUrl = 'https://test.com';
      
      const shareData = generateCompleteShareData(vaultId, baseUrl);
      
      expect(shareData.vaultId).toBe(vaultId);
      expect(shareData.inviteCode.startsWith('GOAL111')).toBe(true);
      expect(shareData.shareUrl.startsWith('https://test.com/join/111?invite=')).toBe(true);
      expect(shareData.qrCodeData).toBe(shareData.shareUrl);
    });

    it('should generate valid invite code that can be parsed', () => {
      const vaultId = BigInt(222);
      const shareData = generateCompleteShareData(vaultId);
      
      const extractedId = extractVaultIdFromInviteCode(shareData.inviteCode);
      expect(extractedId).toBe(vaultId);
    });
  });

  describe('Integration test', () => {
    it('should work end-to-end: generate -> extract -> validate', () => {
      const originalVaultId = BigInt(12345);
      
      // Generate invite code
      const inviteCode = generateFrontendInviteCode(originalVaultId);
      
      // Extract vault ID
      const extractedVaultId = extractVaultIdFromInviteCode(inviteCode);
      
      // Validate format
      const isValid = isValidInviteCodeFormat(inviteCode);
      
      expect(extractedVaultId).toBe(originalVaultId);
      expect(isValid).toBe(true);
    });
  });
});
