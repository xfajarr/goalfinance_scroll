/**
 * @title Offchain Invite Code Generation Example
 * @notice Complete example of how to generate invite codes offchain and validate onchain
 * @dev This demonstrates the gas-efficient approach for invite code management
 */

const { ethers } = require('ethers');

// ============ FRONTEND INVITE CODE GENERATION ============

/**
 * Generate invite code offchain (zero gas cost)
 * @param {number} vaultId - ID of the vault
 * @param {string} creator - Address of vault creator
 * @param {number} createdAt - Vault creation timestamp
 * @param {boolean} isPublic - Whether vault is public
 * @returns {string} Generated invite code (bytes32)
 */
function generateInviteCode(vaultId, creator, createdAt, isPublic) {
    const INVITE_SALT = ethers.keccak256(ethers.toUtf8Bytes("GOALFI_INVITE_V3"));
    
    // Pack parameters exactly like the smart contract
    const packed = ethers.solidityPacked(
        ["bytes32", "uint256", "address", "uint256", "bool"],
        [INVITE_SALT, vaultId, creator, createdAt, isPublic]
    );
    
    return ethers.keccak256(packed);
}

/**
 * Generate human-readable invite code (16 characters)
 * @param {string} inviteCode - Full bytes32 invite code
 * @returns {string} 16-character hex string
 */
function toReadableCode(inviteCode) {
    // Take first 8 bytes (16 hex characters)
    return inviteCode.slice(2, 18); // Remove '0x' and take first 16 chars
}

/**
 * Convert readable code back to full bytes32
 * @param {string} readableCode - 16-character hex string
 * @returns {string} Full bytes32 invite code
 */
function fromReadableCode(readableCode) {
    // Pad with zeros to make it 64 characters (32 bytes)
    return '0x' + readableCode.padEnd(64, '0');
}

/**
 * Check if invite code is expired
 * @param {number} createdAt - Vault creation timestamp
 * @param {number} currentTime - Current timestamp
 * @returns {boolean} True if expired
 */
function isInviteExpired(createdAt, currentTime) {
    const DEFAULT_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds
    return currentTime > createdAt + DEFAULT_EXPIRY;
}

// ============ COMPLETE FRONTEND INTEGRATION ============

class InviteCodeManager {
    constructor(factoryContract, provider) {
        this.factory = factoryContract;
        this.provider = provider;
    }

    /**
     * Generate invite code for a vault (offchain - zero gas)
     * @param {number} vaultId - Vault ID
     * @returns {Object} Invite code information
     */
    async generateInviteCode(vaultId) {
        try {
            // Get vault information from contract
            const vaultInfo = await this.factory.getVault(vaultId);
            
            // Generate invite code offchain (zero gas cost!)
            const inviteCode = generateInviteCode(
                vaultId,
                vaultInfo.creator,
                vaultInfo.createdAt,
                vaultInfo.isPublic
            );
            
            // Create readable version
            const readableCode = toReadableCode(inviteCode);
            
            // Check expiry
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = isInviteExpired(vaultInfo.createdAt, currentTime);
            const expiresAt = Number(vaultInfo.createdAt) + (30 * 24 * 60 * 60);
            
            return {
                vaultId,
                inviteCode,
                readableCode,
                isExpired,
                expiresAt: new Date(expiresAt * 1000),
                vaultInfo
            };
        } catch (error) {
            console.error('Error generating invite code:', error);
            throw error;
        }
    }

    /**
     * Validate invite code and get vault info (onchain validation)
     * @param {string} inviteCode - Invite code to validate
     * @returns {Object} Vault information if valid
     */
    async validateInviteCode(inviteCode) {
        try {
            // This calls the contract to validate and get vault ID
            const vaultId = await this.factory.getVaultByInviteCode(inviteCode);
            const vaultInfo = await this.factory.getVault(vaultId);
            
            return {
                isValid: true,
                vaultId,
                vaultInfo
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * Join vault using invite code
     * @param {string} inviteCode - Invite code
     * @param {number} personalGoalAmount - Personal goal (optional)
     * @returns {Object} Transaction result
     */
    async joinVaultByInvite(inviteCode, personalGoalAmount = 0) {
        try {
            let tx;
            
            if (personalGoalAmount > 0) {
                tx = await this.factory.joinVaultByInviteWithGoal(inviteCode, personalGoalAmount);
            } else {
                tx = await this.factory.joinVaultByInvite(inviteCode);
            }
            
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: receipt.transactionHash,
                gasUsed: receipt.gasUsed
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Join vault using readable code (16-char hex)
     * @param {string} readableCode - 16-character hex string
     * @returns {Object} Transaction result
     */
    async joinVaultByReadableCode(readableCode) {
        try {
            const tx = await this.factory.joinVaultByReadableCode(readableCode);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: receipt.transactionHash,
                gasUsed: receipt.gasUsed
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all invite codes for user's vaults
     * @param {string} userAddress - User's address
     * @returns {Array} Array of invite code objects
     */
    async getUserVaultInviteCodes(userAddress) {
        try {
            const vaultIds = await this.factory.getVaultsByCreator(userAddress);
            const inviteCodes = [];
            
            for (const vaultId of vaultIds) {
                const inviteInfo = await this.generateInviteCode(Number(vaultId));
                inviteCodes.push(inviteInfo);
            }
            
            return inviteCodes;
        } catch (error) {
            console.error('Error getting user invite codes:', error);
            throw error;
        }
    }
}

// ============ USAGE EXAMPLES ============

async function exampleUsage() {
    // Setup (replace with your actual contract addresses and provider)
    const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
    const factoryAddress = 'YOUR_FACTORY_ADDRESS';
    const factoryABI = []; // Your factory ABI
    
    const factory = new ethers.Contract(factoryAddress, factoryABI, provider);
    const inviteManager = new InviteCodeManager(factory, provider);
    
    // Example 1: Generate invite code for vault (zero gas cost!)
    console.log('=== Generating Invite Code (Offchain) ===');
    const vaultId = 1;
    const inviteInfo = await inviteManager.generateInviteCode(vaultId);
    
    console.log('Vault ID:', inviteInfo.vaultId);
    console.log('Full Invite Code:', inviteInfo.inviteCode);
    console.log('Readable Code:', inviteInfo.readableCode);
    console.log('Expires At:', inviteInfo.expiresAt);
    console.log('Is Expired:', inviteInfo.isExpired);
    
    // Example 2: Validate invite code
    console.log('\n=== Validating Invite Code ===');
    const validation = await inviteManager.validateInviteCode(inviteInfo.inviteCode);
    console.log('Is Valid:', validation.isValid);
    if (validation.isValid) {
        console.log('Vault Name:', validation.vaultInfo.vaultName);
        console.log('Target Amount:', validation.vaultInfo.targetAmount);
    }
    
    // Example 3: Join vault using invite code
    console.log('\n=== Joining Vault ===');
    const joinResult = await inviteManager.joinVaultByInvite(inviteInfo.inviteCode, 1000);
    console.log('Join Success:', joinResult.success);
    if (joinResult.success) {
        console.log('Transaction Hash:', joinResult.transactionHash);
        console.log('Gas Used:', joinResult.gasUsed);
    }
    
    // Example 4: Use readable code
    console.log('\n=== Using Readable Code ===');
    const readableJoinResult = await inviteManager.joinVaultByReadableCode(inviteInfo.readableCode);
    console.log('Readable Join Success:', readableJoinResult.success);
}

// ============ REACT COMPONENT EXAMPLE ============

const InviteCodeComponent = `
import React, { useState, useEffect } from 'react';
import { useContract, useAccount } from 'wagmi';

function InviteCodeGenerator({ vaultId }) {
    const [inviteInfo, setInviteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const { address } = useAccount();
    
    const factory = useContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
    });
    
    const generateInviteCode = async () => {
        setLoading(true);
        try {
            // Get vault info from contract
            const vaultInfo = await factory.read.getVault([vaultId]);
            
            // Generate invite code offchain (zero gas!)
            const inviteCode = generateInviteCodeOffchain(
                vaultId,
                vaultInfo.creator,
                vaultInfo.createdAt,
                vaultInfo.isPublic
            );
            
            const readableCode = toReadableCode(inviteCode);
            
            setInviteInfo({
                inviteCode,
                readableCode,
                vaultInfo
            });
        } catch (error) {
            console.error('Error generating invite code:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <button onClick={generateInviteCode} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Invite Code'}
            </button>
            
            {inviteInfo && (
                <div>
                    <p>Invite Code: {inviteInfo.readableCode}</p>
                    <button onClick={() => navigator.clipboard.writeText(inviteInfo.readableCode)}>
                        Copy Code
                    </button>
                </div>
            )}
        </div>
    );
}
`;

module.exports = {
    generateInviteCode,
    toReadableCode,
    fromReadableCode,
    isInviteExpired,
    InviteCodeManager
};
