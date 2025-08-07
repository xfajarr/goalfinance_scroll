/**
 * Utility functions for safe BigInt to Number conversions
 * These helpers prevent runtime errors when working with smart contract data
 */

/**
 * Safely converts a bigint to a number, handling null/undefined values
 * @param value - The bigint value to convert
 * @param fallback - Fallback value if input is null/undefined (default: 0n)
 * @returns Safe number conversion
 */
export function safeBigIntToNumber(value: bigint | null | undefined, fallback: bigint = 0n): number {
  try {
    return Number(value || fallback);
  } catch (error) {
    console.warn('Error converting bigint to number:', error);
    return Number(fallback);
  }
}

/**
 * Safely converts a bigint amount to a decimal number with proper scaling
 * @param value - The bigint value to convert
 * @param decimals - Number of decimal places (default: 6 for USDC)
 * @param fallback - Fallback value if input is null/undefined (default: 0n)
 * @returns Scaled decimal number
 */
export function safeBigIntToDecimal(
  value: bigint | null | undefined, 
  decimals: number = 6, 
  fallback: bigint = 0n
): number {
  try {
    const safeValue = value || fallback;
    const divisor = Math.pow(10, decimals);
    return Number(safeValue) / divisor;
  } catch (error) {
    console.warn('Error converting bigint to decimal:', error);
    return Number(fallback) / Math.pow(10, decimals);
  }
}

/**
 * Safely formats a bigint amount as currency
 * @param value - The bigint value to format
 * @param decimals - Number of decimal places (default: 6 for USDC)
 * @param currency - Currency symbol (default: 'USD')
 * @param fallback - Fallback value if input is null/undefined (default: 0n)
 * @returns Formatted currency string
 */
export function formatBigIntAsCurrency(
  value: bigint | null | undefined,
  decimals: number = 6,
  currency: string = 'USD',
  fallback: bigint = 0n
): string {
  const decimalValue = safeBigIntToDecimal(value, decimals, fallback);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(decimalValue);
}

/**
 * Safely calculates percentage from two bigint values
 * @param current - Current amount (bigint)
 * @param target - Target amount (bigint)
 * @param fallback - Fallback percentage if calculation fails (default: 0)
 * @returns Percentage as number (0-100)
 */
export function safeBigIntPercentage(
  current: bigint | null | undefined,
  target: bigint | null | undefined,
  fallback: number = 0
): number {
  try {
    const currentNum = Number(current || 0n);
    const targetNum = Number(target || 0n);
    
    if (targetNum === 0) return fallback;
    
    return Math.min(100, (currentNum / targetNum) * 100);
  } catch (error) {
    console.warn('Error calculating bigint percentage:', error);
    return fallback;
  }
}

/**
 * Type guard to check if a value is a valid bigint
 * @param value - Value to check
 * @returns True if value is a valid bigint
 */
export function isBigInt(value: any): value is bigint {
  return typeof value === 'bigint';
}

/**
 * Safely compares two bigint values
 * @param a - First bigint value
 * @param b - Second bigint value
 * @returns Comparison result (-1, 0, 1)
 */
export function compareBigInt(a: bigint | null | undefined, b: bigint | null | undefined): number {
  const safeA = a || 0n;
  const safeB = b || 0n;
  
  if (safeA < safeB) return -1;
  if (safeA > safeB) return 1;
  return 0;
}
