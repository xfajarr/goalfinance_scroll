import { useChainId } from 'wagmi';
import { Address } from 'viem';
import { 
  getNativeTokenInfo, 
  getTokenSymbol, 
  getTokenLogo, 
  getTokenDisplayName,
  NativeTokenInfo 
} from '@/utils/chainHelpers';
import { NATIVE_TOKEN, getSupportedTokensForChain } from '@/config/contracts';

export interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  displayName: string;
  isNative: boolean;
}

export interface TokenOption {
  value: Address;
  label: string;
  symbol: string;
  logoUrl: string;
  isNative: boolean;
}

/**
 * Hook to get token information based on current chain
 */
export function useTokenInfo(tokenAddress?: Address): TokenInfo | null {
  const chainId = useChainId();

  if (!tokenAddress) return null;

  const isNative = tokenAddress === NATIVE_TOKEN;
  
  if (isNative) {
    const nativeInfo = getNativeTokenInfo(chainId);
    return {
      address: tokenAddress,
      symbol: nativeInfo.symbol,
      name: nativeInfo.name,
      decimals: nativeInfo.decimals,
      logoUrl: nativeInfo.logoUrl,
      displayName: nativeInfo.displayName,
      isNative: true,
    };
  }

  // For non-native tokens (currently just USDC)
  return {
    address: tokenAddress,
    symbol: getTokenSymbol(tokenAddress, chainId),
    name: 'USD Coin', // Could be expanded with a token registry
    decimals: 6, // USDC has 6 decimals
    logoUrl: getTokenLogo(tokenAddress, chainId),
    displayName: getTokenDisplayName(tokenAddress, chainId),
    isNative: false,
  };
}

/**
 * Hook to get native token information for current chain
 */
export function useNativeTokenInfo(): NativeTokenInfo {
  const chainId = useChainId();
  return getNativeTokenInfo(chainId);
}

/**
 * Hook to get supported token options for current chain
 */
export function useSupportedTokens(): TokenOption[] {
  const chainId = useChainId();
  const nativeInfo = getNativeTokenInfo(chainId);
  const supportedTokenAddresses = getSupportedTokensForChain(chainId);

  return supportedTokenAddresses.map((tokenAddress) => {
    const isNative = tokenAddress === NATIVE_TOKEN;

    if (isNative) {
      return {
        value: tokenAddress as Address,
        label: nativeInfo.displayName,
        symbol: 'ETH', // Changed from MNT to ETH
        logoUrl: '/ethereum-eth-logo.svg',
        isNative: true,
      };
    }

    // For non-native tokens (currently just USDC)
    return {
      value: tokenAddress as Address,
      label: 'USDC',
      symbol: 'USDC',
      logoUrl: '/usdc-logo.svg',
      isNative: false,
    };
  });
}

/**
 * Hook to get token symbol for display
 */
export function useTokenSymbol(tokenAddress?: Address): string {
  const chainId = useChainId();
  
  if (!tokenAddress) return '';
  
  return getTokenSymbol(tokenAddress, chainId);
}

/**
 * Hook to get token logo URL
 */
export function useTokenLogo(tokenAddress?: Address): string {
  const chainId = useChainId();
  
  if (!tokenAddress) return '';
  
  return getTokenLogo(tokenAddress, chainId);
}

/**
 * Hook to check if a token is native
 */
export function useIsNativeToken(tokenAddress?: Address): boolean {
  return tokenAddress === NATIVE_TOKEN;
}

/**
 * Hook to get formatted token amount with symbol
 */
export function useFormattedTokenAmount(amount: bigint, tokenAddress?: Address): string {
  const tokenInfo = useTokenInfo(tokenAddress);
  
  if (!tokenInfo) return '0';
  
  const decimals = tokenInfo.decimals;
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  // Format with appropriate decimal places
  if (fractionalPart === 0n) {
    return `${wholePart} ${tokenInfo.symbol}`;
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return `${wholePart} ${tokenInfo.symbol}`;
  }
  
  return `${wholePart}.${trimmedFractional} ${tokenInfo.symbol}`;
}

/**
 * Hook to get token decimals
 */
export function useTokenDecimals(tokenAddress?: Address): number {
  const tokenInfo = useTokenInfo(tokenAddress);
  return tokenInfo?.decimals || 18;
}

/**
 * Utility function to format token amount for display
 */
export function formatTokenAmount(
  amount: bigint, 
  decimals: number, 
  symbol: string,
  maxDecimals: number = 4
): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return `${wholePart} ${symbol}`;
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.slice(0, maxDecimals).replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return `${wholePart} ${symbol}`;
  }
  
  return `${wholePart}.${trimmedFractional} ${symbol}`;
}

/**
 * Hook to get all token information for current chain
 */
export function useChainTokens() {
  const chainId = useChainId();
  const supportedTokens = useSupportedTokens();
  const nativeInfo = useNativeTokenInfo();

  return {
    chainId,
    nativeToken: nativeInfo,
    supportedTokens,
    getNativeTokenAddress: () => NATIVE_TOKEN,
    getUSDCAddress: () => supportedTokens.find(t => !t.isNative)?.value,
  };
}
