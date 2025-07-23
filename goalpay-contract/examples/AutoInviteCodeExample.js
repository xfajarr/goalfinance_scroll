/**
 * @title Automatic Invite Code System Example
 * @notice Complete example of how to use the automatic invite code generation system
 * @dev Invite codes are automatically generated when vaults are created
 */

const { ethers } = require('ethers');

// ============ FRONTEND INTEGRATION ============

class AutoInviteCodeManager {
    constructor(factoryContract, provider) {
        this.factory = factoryContract;
        this.provider = provider;
    }

    /**
     * Create vault and get automatically generated invite code
     * @param {Object} vaultParams - Vault creation parameters
     * @returns {Object} Vault creation result with invite code
     */
    async createVaultWithInviteCode(vaultParams) {
        try {
            const {
                vaultName,
                description,
                targetAmount,
                deadline,
                isPublic,
                goalType,
                token
            } = vaultParams;

            // Create vault (invite code automatically generated!)
            const tx = await this.factory.createVault(
                vaultName,
                description,
                targetAmount,
                deadline,
                isPublic,
                goalType,
                token
            );

            const receipt = await tx.wait();
            
            // Extract vault ID from events
            const vaultCreatedEvent = receipt.logs.find(
                log => log.topics[0] === ethers.id("VaultCreated(uint256,address,address,string,string,uint256,uint256,bool,address,string,uint256)")
            );
            
            const vaultId = parseInt(vaultCreatedEvent.topics[1], 16);

            // Get the automatically generated invite code
            const inviteCode = await this.factory.getInviteCode(vaultId);
            const readableCode = await this.factory.getReadableInviteCode(vaultId);

            return {
                success: true,
                vaultId,
                inviteCode,
                readableCode,
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
     * Get invite code for existing vault
     * @param {number} vaultId - Vault ID
     * @returns {Object} Invite code information
     */
    async getVaultInviteCode(vaultId) {
        try {
            const inviteCode = await this.factory.getInviteCode(vaultId);
            const readableCode = await this.factory.getReadableInviteCode(vaultId);
            const vaultInfo = await this.factory.getVault(vaultId);

            return {
                vaultId,
                inviteCode,
                readableCode,
                vaultInfo,
                shareUrl: `https://goalfi.app/join/${readableCode}`
            };
        } catch (error) {
            throw new Error(`Failed to get invite code: ${error.message}`);
        }
    }

    /**
     * Join vault using invite code
     * @param {string} inviteCode - Full invite code or readable code
     * @param {number} personalGoalAmount - Personal goal (optional)
     * @returns {Object} Join result
     */
    async joinVaultByInvite(inviteCode, personalGoalAmount = 0) {
        try {
            let tx;

            // Check if it's a readable code (8 characters) or full code
            if (typeof inviteCode === 'string' && inviteCode.length === 8) {
                // It's a readable code
                if (personalGoalAmount > 0) {
                    // Convert to bytes32 first, then join with goal
                    const fullCode = await this._getFullCodeFromReadable(inviteCode);
                    tx = await this.factory.joinVaultByInviteWithGoal(fullCode, personalGoalAmount);
                } else {
                    tx = await this.factory.joinVaultByReadableCode(inviteCode);
                }
            } else {
                // It's a full bytes32 code
                if (personalGoalAmount > 0) {
                    tx = await this.factory.joinVaultByInviteWithGoal(inviteCode, personalGoalAmount);
                } else {
                    tx = await this.factory.joinVaultByInvite(inviteCode);
                }
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
     * Validate invite code and get vault info
     * @param {string} inviteCode - Invite code to validate
     * @returns {Object} Validation result
     */
    async validateInviteCode(inviteCode) {
        try {
            let vaultId;

            if (typeof inviteCode === 'string' && inviteCode.length === 8) {
                // Readable code
                vaultId = await this.factory.getVaultByReadableCode(inviteCode);
            } else {
                // Full code
                vaultId = await this.factory.getVaultByInviteCode(inviteCode);
            }

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
     * Get all invite codes for user's vaults
     * @param {string} userAddress - User's address
     * @returns {Array} Array of invite code objects
     */
    async getUserVaultInviteCodes(userAddress) {
        try {
            const vaultIds = await this.factory.getVaultsByCreator(userAddress);
            const inviteCodes = [];

            for (const vaultId of vaultIds) {
                const inviteInfo = await this.getVaultInviteCode(Number(vaultId));
                inviteCodes.push(inviteInfo);
            }

            return inviteCodes;
        } catch (error) {
            console.error('Error getting user invite codes:', error);
            throw error;
        }
    }

    /**
     * Helper function to get full code from readable code
     */
    async _getFullCodeFromReadable(readableCode) {
        const vaultId = await this.factory.getVaultByReadableCode(readableCode);
        return await this.factory.getInviteCode(vaultId);
    }
}

// ============ USAGE EXAMPLES ============

async function exampleUsage() {
    // Setup (replace with your actual contract addresses and provider)
    const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
    const factoryAddress = 'YOUR_FACTORY_ADDRESS';
    const factoryABI = []; // Your factory ABI
    
    const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);
    const factory = new ethers.Contract(factoryAddress, factoryABI, signer);
    const inviteManager = new AutoInviteCodeManager(factory, provider);
    
    // Example 1: Create vault and get invite code automatically
    console.log('=== Creating Vault with Auto Invite Code ===');
    const createResult = await inviteManager.createVaultWithInviteCode({
        vaultName: "Family Vacation Fund",
        description: "Saving for our summer vacation",
        targetAmount: ethers.parseUnits("5000", 6), // 5000 USDC
        deadline: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days
        isPublic: true,
        goalType: 0, // GROUP
        token: "0x..." // USDC address
    });

    if (createResult.success) {
        console.log('Vault Created!');
        console.log('Vault ID:', createResult.vaultId);
        console.log('Invite Code:', createResult.inviteCode);
        console.log('Readable Code:', createResult.readableCode);
        console.log('Share this code with friends:', createResult.readableCode);
    }

    // Example 2: Get invite code for existing vault
    console.log('\n=== Getting Invite Code for Existing Vault ===');
    const vaultId = 1;
    const inviteInfo = await inviteManager.getVaultInviteCode(vaultId);
    
    console.log('Vault Name:', inviteInfo.vaultInfo.vaultName);
    console.log('Readable Code:', inviteInfo.readableCode);
    console.log('Share URL:', inviteInfo.shareUrl);

    // Example 3: Join vault using readable code
    console.log('\n=== Joining Vault with Readable Code ===');
    const readableCode = inviteInfo.readableCode;
    const joinResult = await inviteManager.joinVaultByInvite(readableCode, 1000);
    
    if (joinResult.success) {
        console.log('Successfully joined vault!');
        console.log('Transaction Hash:', joinResult.transactionHash);
    }

    // Example 4: Validate invite code
    console.log('\n=== Validating Invite Code ===');
    const validation = await inviteManager.validateInviteCode(readableCode);
    
    if (validation.isValid) {
        console.log('Valid invite code for vault:', validation.vaultInfo.vaultName);
        console.log('Target Amount:', validation.vaultInfo.targetAmount);
        console.log('Current Members:', validation.vaultInfo.memberCount);
    }
}

// ============ REACT COMPONENT EXAMPLE ============

const ReactComponentExample = `
import React, { useState, useEffect } from 'react';
import { useContract, useAccount, useContractWrite } from 'wagmi';

function VaultInviteManager({ vaultId }) {
    const [inviteInfo, setInviteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const { address } = useAccount();
    
    const factory = useContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
    });

    // Get invite code for vault (automatically generated when vault was created)
    useEffect(() => {
        const getInviteCode = async () => {
            if (!vaultId || !factory) return;
            
            try {
                setLoading(true);
                const inviteCode = await factory.read.getInviteCode([vaultId]);
                const readableCode = await factory.read.getReadableInviteCode([vaultId]);
                const vaultInfo = await factory.read.getVault([vaultId]);
                
                setInviteInfo({
                    inviteCode,
                    readableCode,
                    vaultInfo,
                    shareUrl: \`https://goalfi.app/join/\${readableCode}\`
                });
            } catch (error) {
                console.error('Error getting invite code:', error);
            } finally {
                setLoading(false);
            }
        };

        getInviteCode();
    }, [vaultId, factory]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Show toast notification
    };

    const shareVault = () => {
        if (navigator.share && inviteInfo) {
            navigator.share({
                title: inviteInfo.vaultInfo.vaultName,
                text: 'Join my savings vault on GoalFi!',
                url: inviteInfo.shareUrl
            });
        }
    };

    if (loading) return <div>Loading invite code...</div>;
    if (!inviteInfo) return <div>No invite code available</div>;

    return (
        <div className="invite-manager">
            <h3>Invite Friends & Family</h3>
            
            <div className="invite-code-section">
                <label>Invite Code:</label>
                <div className="code-display">
                    <code>{inviteInfo.readableCode}</code>
                    <button onClick={() => copyToClipboard(inviteInfo.readableCode)}>
                        Copy Code
                    </button>
                </div>
            </div>

            <div className="share-section">
                <button onClick={() => copyToClipboard(inviteInfo.shareUrl)}>
                    Copy Share Link
                </button>
                <button onClick={shareVault}>
                    Share Vault
                </button>
            </div>

            <div className="vault-info">
                <p>Vault: {inviteInfo.vaultInfo.vaultName}</p>
                <p>Members: {inviteInfo.vaultInfo.memberCount}</p>
                <p>Target: {inviteInfo.vaultInfo.targetAmount} USDC</p>
            </div>
        </div>
    );
}

function JoinVaultByCode() {
    const [inviteCode, setInviteCode] = useState('');
    const [personalGoal, setPersonalGoal] = useState('');
    
    const { write: joinVault } = useContractWrite({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'joinVaultByReadableCode',
    });

    const handleJoin = () => {
        if (inviteCode.length === 8) {
            // It's a readable code
            joinVault({
                args: [inviteCode]
            });
        }
    };

    return (
        <div className="join-vault">
            <h3>Join Vault</h3>
            <input
                type="text"
                placeholder="Enter 8-character invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                maxLength={8}
            />
            <input
                type="number"
                placeholder="Personal goal (optional)"
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
            />
            <button onClick={handleJoin} disabled={inviteCode.length !== 8}>
                Join Vault
            </button>
        </div>
    );
}
`;

module.exports = {
    AutoInviteCodeManager,
    exampleUsage
};
