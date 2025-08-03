/**
 * Utility functions for invite code generation and validation
 * Frontend-based hybrid approach for fast, gas-free invite codes
 */

export interface InviteCodeComponents {
  vaultId: bigint;
  timestamp: number;
  randomSuffix: string;
}

/**
 * Generate a readable invite code instantly on frontend
 * Format: GOAL{goalId}{timestamp_base36}{random_suffix}
 * Example: GOAL123ABC4XYZ9
 */
export function generateFrontendInviteCode(vaultId: bigint): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const timestampBase36 = timestamp.toString(36).toUpperCase().slice(-4);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `GOAL${vaultId}${timestampBase36}${randomSuffix}`;
}

/**
 * Extract goal ID from frontend-generated invite code
 * Returns null if invalid format
 */
export function extractVaultIdFromInviteCode(inviteCode: string): bigint | null {
  try {
    // Must start with GOAL
    if (!inviteCode.startsWith('GOAL')) {
      return null;
    }
    
    const codeWithoutPrefix = inviteCode.slice(4); // Remove 'GOAL'
    
    // Extract goal ID (numeric part at the beginning)
    let vaultIdStr = '';
    for (let i = 0; i < codeWithoutPrefix.length; i++) {
      const char = codeWithoutPrefix[i];
      if (char >= '0' && char <= '9') {
        vaultIdStr += char;
      } else {
        break; // Stop at first non-numeric character
      }
    }
    
    if (vaultIdStr.length === 0) {
      return null;
    }
    
    return BigInt(vaultIdStr);
  } catch {
    return null;
  }
}

/**
 * Parse invite code into components for validation
 */
export function parseInviteCode(inviteCode: string): InviteCodeComponents | null {
  try {
    if (!inviteCode.startsWith('GOAL')) {
      return null;
    }
    
    const codeWithoutPrefix = inviteCode.slice(4);
    
    // Extract goal ID
    let vaultIdStr = '';
    let i = 0;
    for (; i < codeWithoutPrefix.length; i++) {
      const char = codeWithoutPrefix[i];
      if (char >= '0' && char <= '9') {
        vaultIdStr += char;
      } else {
        break;
      }
    }
    
    if (vaultIdStr.length === 0) {
      return null;
    }
    
    const vaultId = BigInt(vaultIdStr);
    
    // Extract timestamp and random suffix
    const remaining = codeWithoutPrefix.slice(i);
    if (remaining.length < 8) { // At least 4 chars for timestamp + 4 for random
      return null;
    }
    
    const timestampBase36 = remaining.slice(0, 4);
    const randomSuffix = remaining.slice(4);
    
    // Convert timestamp back to number (approximate)
    const timestamp = parseInt(timestampBase36, 36);
    
    return {
      vaultId,
      timestamp,
      randomSuffix,
    };
  } catch {
    return null;
  }
}

/**
 * Validate invite code format without blockchain calls
 */
export function isValidInviteCodeFormat(inviteCode: string): boolean {
  return extractVaultIdFromInviteCode(inviteCode) !== null;
}

/**
 * Generate shareable URL with invite code
 */
export function generateShareUrl(vaultId: bigint, inviteCode: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/join/${vaultId}?invite=${inviteCode}`;
}

/**
 * Generate QR code data for sharing
 */
export function generateQRCodeData(shareUrl: string): string {
  return shareUrl;
}

/**
 * Create complete share data for a goal
 */
export interface ShareData {
  vaultId: bigint;
  inviteCode: string;
  shareUrl: string;
  qrCodeData: string;
}

export function generateCompleteShareData(vaultId: bigint, baseUrl?: string): ShareData {
  const inviteCode = generateFrontendInviteCode(vaultId);
  const shareUrl = generateShareUrl(vaultId, inviteCode, baseUrl);
  const qrCodeData = generateQRCodeData(shareUrl);

  return {
    vaultId,
    inviteCode,
    shareUrl,
    qrCodeData,
  };
}

/**
 * Extract invite code from URL parameters
 * Handles URLs like: http://localhost:8080/join/2?invite=0x2b04ccd3b660244872a6294387c17cb48e6cc1cb4dd969a36e78ddd9a9810b85
 */
export function extractInviteCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('invite');
  } catch {
    return null;
  }
}

/**
 * Extract invite code from current window location
 */
export function extractInviteCodeFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return extractInviteCodeFromUrl(window.location.href);
}

/**
 * Parse invite link and extract both vault ID and invite code
 */
export interface ParsedInviteLink {
  vaultId: bigint | null;
  inviteCode: string | null;
  isValid: boolean;
}

export function parseInviteLink(url: string): ParsedInviteLink {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Expected format: /join/{vaultId}
    if (pathParts.length >= 3 && pathParts[1] === 'join') {
      const vaultIdStr = pathParts[2];
      const vaultId = BigInt(vaultIdStr);
      const inviteCode = urlObj.searchParams.get('invite');

      return {
        vaultId,
        inviteCode,
        isValid: vaultId > 0n && inviteCode !== null
      };
    }

    return { vaultId: null, inviteCode: null, isValid: false };
  } catch {
    return { vaultId: null, inviteCode: null, isValid: false };
  }
}

/**
 * Validate if a string is a proper invite link format
 */
export function isValidInviteLink(url: string): boolean {
  const parsed = parseInviteLink(url);
  return parsed.isValid;
}
