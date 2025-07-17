# GoalFi Contract Deployment Guide

This guide explains how to deploy GoalFi contracts to any EVM-compatible blockchain using the dynamic deployment scripts.

## Prerequisites

1. **Foundry installed** - Install from [getfoundry.sh](https://getfoundry.sh/)
2. **Environment variables configured** - Set up your `.env` file
3. **Network native tokens** - Ensure you have enough tokens for gas fees

## Environment Setup

Make sure your `.env` file contains:

```bash
# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-api-key
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-api-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# API Keys for verification
BASESCAN_API_KEY=your_basescan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
MANTLESCAN_API_KEY=your_mantlescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Quick Deployment

For interactive deployment with guided prompts:

```bash
./quick-deploy.sh
```

This will:
1. Show available networks
2. Ask if you want to verify contracts
3. Deploy and optionally verify

## Manual Deployment

### Basic Deployment

Deploy to any supported network:

```bash
./deploy.sh <network>
```

### Deploy with Verification

Deploy and automatically verify contracts:

```bash
./deploy.sh <network> verify
```

## Supported Networks

### Testnets (Recommended for testing)
- `base-sepolia` - Base Sepolia Testnet
- `arbitrum-sepolia` - Arbitrum Sepolia Testnet  
- `mantle-sepolia` - Mantle Sepolia Testnet
- `sepolia` - Ethereum Sepolia Testnet

### Mainnets (Production)
- `base` - Base Mainnet
- `arbitrum` - Arbitrum One
- `ethereum` - Ethereum Mainnet
- `optimism` - Optimism Mainnet
- `polygon` - Polygon Mainnet

## Examples

### Deploy to Base Sepolia (Testnet)
```bash
./deploy.sh base-sepolia verify
```

### Deploy to Arbitrum One (Mainnet)
```bash
./deploy.sh arbitrum verify
```

### Deploy to Mantle Sepolia
```bash
./deploy.sh mantle-sepolia verify
```

## What Gets Deployed

The deployment script deploys:

1. **MockUSDC** - Test USDC token (for testnets)
2. **GoalVaultFactory** - Main factory contract for creating goal vaults

## Deployment Outputs

After successful deployment:

1. **Contract addresses** are saved to `deployments/<network>.json`
2. **Broadcast logs** are saved to `broadcast/` directory
3. **Console output** shows deployment summary

Example `deployments/base-sepolia.json`:
```json
{
  "network": "Base Sepolia",
  "chainId": 84532,
  "MockUSDC": "0x1234...",
  "GoalVaultFactory": "0x5678...",
  "explorer": "https://sepolia.basescan.org",
  "deployedAt": 1703123456
}
```

## Contract Verification

### Automatic Verification
Most networks support automatic verification during deployment:
```bash
./deploy.sh base-sepolia verify
```

### Manual Verification (Mantle)
For Mantle Sepolia, verification uses custom parameters:
```bash
forge verify-contract \
  --verifier-url https://api-sepolia.mantlescan.xyz/api \
  --etherscan-api-key $MANTLESCAN_API_KEY \
  --compiler-version "v0.8.24+commit.e11b9ed9" \
  <contract_address> \
  src/GoalVaultFactory.sol:GoalVaultFactory \
  --constructor-args $(cast abi-encode "constructor(address)" <usdc_address>) \
  --watch
```

## Troubleshooting

### Common Issues

1. **Insufficient gas fees**
   - Ensure you have enough native tokens (ETH, MNT, etc.)
   - Check current gas prices on the network

2. **RPC URL issues**
   - Verify your RPC URLs in `.env` are correct
   - Try alternative RPC providers if one fails

3. **API key issues**
   - Ensure API keys are valid and have sufficient quota
   - Get API keys from respective block explorers

4. **Verification failures**
   - Try deploying without verification first
   - Manually verify later using the provided commands

### Getting API Keys

- **Etherscan**: https://etherscan.io/apis
- **Basescan**: https://basescan.org/apis  
- **Arbiscan**: https://arbiscan.io/apis
- **Mantlescan**: https://mantlescan.xyz/apis

## Network-Specific Notes

### Mantle Sepolia
- Uses custom verifier URL
- Requires specific compiler version
- May need manual verification

### Base Networks
- Fast and cheap transactions
- Good for testing and production

### Arbitrum Networks  
- Layer 2 solution with low fees
- Compatible with Ethereum tooling

## Security Considerations

1. **Never commit private keys** to version control
2. **Use testnet first** before mainnet deployment
3. **Verify contract source code** after deployment
4. **Test thoroughly** on testnets before production

## Next Steps

After deployment:

1. **Test contract functionality** using the deployed addresses
2. **Update frontend configuration** with new contract addresses
3. **Set up monitoring** for contract events
4. **Consider security audits** for mainnet deployments

## Support

For issues or questions:
- Check the deployment logs in `broadcast/` directory
- Verify network configuration in `networks.json`
- Ensure all prerequisites are met
