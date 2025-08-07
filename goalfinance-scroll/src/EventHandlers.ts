/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  AcornsVault,
  AcornsVault_FundsDeposited,
  AcornsVault_FundsWithdrawn,
  AcornsVault_OwnershipTransferred,
  AcornsVault_Paused,
  AcornsVault_PortfolioChanged,
  AcornsVault_PurchaseRecorded,
  AcornsVault_RecurringInvestmentExecuted,
  AcornsVault_RecurringInvestmentSet,
  AcornsVault_RoundUpsInvested,
  AcornsVault_TokenSupported,
  AcornsVault_Unpaused,
  AcornsVault_UserRegistered,
  AcornsVault_YieldClaimed,
  GoalFinance,
  GoalFinance_EarlyWithdrawal,
  GoalFinance_FundsDeposited,
  GoalFinance_GoalReached,
  GoalFinance_MemberJoined,
  GoalFinance_OwnershipTransferred,
  GoalFinance_Paused,
  GoalFinance_PenaltyReleased,
  GoalFinance_TokenSupported,
  GoalFinance_Unpaused,
  GoalFinance_VaultCreated,
  GoalFinance_VaultExpired,
  GoalFinance_VaultFailed,
  GoalFinance_VaultStatusUpdated,
  GoalFinance_Withdrawal,
  MockMorpho,
  MockMorpho_ContractAuthorized,
  MockMorpho_InterestAccrued,
  MockMorpho_MarketCreated,
  MockMorpho_OwnershipTransferred,
  MockMorpho_Supplied,
  MockMorpho_Withdrawn,
  MockUSDT,
  MockUSDT_Approval,
  MockUSDT_FaucetClaimed,
  MockUSDT_OwnershipTransferred,
  MockUSDT_Transfer,
} from "generated";

AcornsVault.FundsDeposited.handler(async ({ event, context }) => {
  const entity: AcornsVault_FundsDeposited = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    token: event.params.token,
    amount: event.params.amount,
  };

  context.AcornsVault_FundsDeposited.set(entity);
});

AcornsVault.FundsWithdrawn.handler(async ({ event, context }) => {
  const entity: AcornsVault_FundsWithdrawn = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
  };

  context.AcornsVault_FundsWithdrawn.set(entity);
});

AcornsVault.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: AcornsVault_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.AcornsVault_OwnershipTransferred.set(entity);
});

AcornsVault.Paused.handler(async ({ event, context }) => {
  const entity: AcornsVault_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.AcornsVault_Paused.set(entity);
});

AcornsVault.PortfolioChanged.handler(async ({ event, context }) => {
  const entity: AcornsVault_PortfolioChanged = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    oldPortfolio: event.params.oldPortfolio,
    newPortfolio: event.params.newPortfolio,
  };

  context.AcornsVault_PortfolioChanged.set(entity);
});

AcornsVault.PurchaseRecorded.handler(async ({ event, context }) => {
  const entity: AcornsVault_PurchaseRecorded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
    roundUp: event.params.roundUp,
    merchant: event.params.merchant,
  };

  context.AcornsVault_PurchaseRecorded.set(entity);
});

AcornsVault.RecurringInvestmentExecuted.handler(async ({ event, context }) => {
  const entity: AcornsVault_RecurringInvestmentExecuted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
  };

  context.AcornsVault_RecurringInvestmentExecuted.set(entity);
});

AcornsVault.RecurringInvestmentSet.handler(async ({ event, context }) => {
  const entity: AcornsVault_RecurringInvestmentSet = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
    interval: event.params.interval,
  };

  context.AcornsVault_RecurringInvestmentSet.set(entity);
});

AcornsVault.RoundUpsInvested.handler(async ({ event, context }) => {
  const entity: AcornsVault_RoundUpsInvested = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
  };

  context.AcornsVault_RoundUpsInvested.set(entity);
});

AcornsVault.TokenSupported.handler(async ({ event, context }) => {
  const entity: AcornsVault_TokenSupported = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    token: event.params.token,
    supported: event.params.supported,
    exchangeRate: event.params.exchangeRate,
  };

  context.AcornsVault_TokenSupported.set(entity);
});

AcornsVault.Unpaused.handler(async ({ event, context }) => {
  const entity: AcornsVault_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.AcornsVault_Unpaused.set(entity);
});

AcornsVault.UserRegistered.handler(async ({ event, context }) => {
  const entity: AcornsVault_UserRegistered = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    portfolio: event.params.portfolio,
  };

  context.AcornsVault_UserRegistered.set(entity);
});

AcornsVault.YieldClaimed.handler(async ({ event, context }) => {
  const entity: AcornsVault_YieldClaimed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
  };

  context.AcornsVault_YieldClaimed.set(entity);
});

GoalFinance.EarlyWithdrawal.handler(async ({ event, context }) => {
  const entity: GoalFinance_EarlyWithdrawal = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    member: event.params.member,
    token: event.params.token,
    amount: event.params.amount,
    penalty: event.params.penalty,
  };

  context.GoalFinance_EarlyWithdrawal.set(entity);
});

GoalFinance.FundsDeposited.handler(async ({ event, context }) => {
  const entity: GoalFinance_FundsDeposited = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    member: event.params.member,
    token: event.params.token,
    amount: event.params.amount,
    totalDeposited: event.params.totalDeposited,
  };

  context.GoalFinance_FundsDeposited.set(entity);
});

GoalFinance.GoalReached.handler(async ({ event, context }) => {
  const entity: GoalFinance_GoalReached = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    token: event.params.token,
    totalAmount: event.params.totalAmount,
  };

  context.GoalFinance_GoalReached.set(entity);
});

GoalFinance.MemberJoined.handler(async ({ event, context }) => {
  const entity: GoalFinance_MemberJoined = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    member: event.params.member,
    token: event.params.token,
    depositAmount: event.params.depositAmount,
    memberCount: event.params.memberCount,
  };

  context.GoalFinance_MemberJoined.set(entity);
});

GoalFinance.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: GoalFinance_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.GoalFinance_OwnershipTransferred.set(entity);
});

GoalFinance.Paused.handler(async ({ event, context }) => {
  const entity: GoalFinance_Paused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.GoalFinance_Paused.set(entity);
});

GoalFinance.PenaltyReleased.handler(async ({ event, context }) => {
  const entity: GoalFinance_PenaltyReleased = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    token: event.params.token,
    amount: event.params.amount,
  };

  context.GoalFinance_PenaltyReleased.set(entity);
});

GoalFinance.TokenSupported.handler(async ({ event, context }) => {
  const entity: GoalFinance_TokenSupported = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    token: event.params.token,
    supported: event.params.supported,
  };

  context.GoalFinance_TokenSupported.set(entity);
});

GoalFinance.Unpaused.handler(async ({ event, context }) => {
  const entity: GoalFinance_Unpaused = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account,
  };

  context.GoalFinance_Unpaused.set(entity);
});

GoalFinance.VaultCreated.handler(async ({ event, context }) => {
  const entity: GoalFinance_VaultCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    creator: event.params.creator,
    token: event.params.token,
    config_0: event.params.config
        [0]
    ,
    config_1: event.params.config
        [1]
    ,
    config_2: event.params.config
        [2]
    ,
    config_3: event.params.config
        [3]
    ,
    config_4: event.params.config
        [4]
    ,
    config_5: event.params.config
        [5]
    ,
    config_6: event.params.config
        [6]
    ,
    config_7: event.params.config
        [7]
    ,
    inviteCode: event.params.inviteCode,
  };

  context.GoalFinance_VaultCreated.set(entity);
});

GoalFinance.VaultExpired.handler(async ({ event, context }) => {
  const entity: GoalFinance_VaultExpired = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    token: event.params.token,
    totalDeposited: event.params.totalDeposited,
  };

  context.GoalFinance_VaultExpired.set(entity);
});

GoalFinance.VaultFailed.handler(async ({ event, context }) => {
  const entity: GoalFinance_VaultFailed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    token: event.params.token,
    totalAmount: event.params.totalAmount,
  };

  context.GoalFinance_VaultFailed.set(entity);
});

GoalFinance.VaultStatusUpdated.handler(async ({ event, context }) => {
  const entity: GoalFinance_VaultStatusUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    newStatus: event.params.newStatus,
    totalDeposited: event.params.totalDeposited,
  };

  context.GoalFinance_VaultStatusUpdated.set(entity);
});

GoalFinance.Withdrawal.handler(async ({ event, context }) => {
  const entity: GoalFinance_Withdrawal = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    vaultId: event.params.vaultId,
    member: event.params.member,
    token: event.params.token,
    amount: event.params.amount,
  };

  context.GoalFinance_Withdrawal.set(entity);
});

MockMorpho.ContractAuthorized.handler(async ({ event, context }) => {
  const entity: MockMorpho_ContractAuthorized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    contractAddr: event.params.contractAddr,
    authorized: event.params.authorized,
  };

  context.MockMorpho_ContractAuthorized.set(entity);
});

MockMorpho.InterestAccrued.handler(async ({ event, context }) => {
  const entity: MockMorpho_InterestAccrued = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    token: event.params.token,
    interest: event.params.interest,
  };

  context.MockMorpho_InterestAccrued.set(entity);
});

MockMorpho.MarketCreated.handler(async ({ event, context }) => {
  const entity: MockMorpho_MarketCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    token: event.params.token,
    supplyAPY: event.params.supplyAPY,
  };

  context.MockMorpho_MarketCreated.set(entity);
});

MockMorpho.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: MockMorpho_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.MockMorpho_OwnershipTransferred.set(entity);
});

MockMorpho.Supplied.handler(async ({ event, context }) => {
  const entity: MockMorpho_Supplied = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    token: event.params.token,
    amount: event.params.amount,
  };

  context.MockMorpho_Supplied.set(entity);
});

MockMorpho.Withdrawn.handler(async ({ event, context }) => {
  const entity: MockMorpho_Withdrawn = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    token: event.params.token,
    amount: event.params.amount,
    interest: event.params.interest,
  };

  context.MockMorpho_Withdrawn.set(entity);
});

MockUSDT.Approval.handler(async ({ event, context }) => {
  const entity: MockUSDT_Approval = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    spender: event.params.spender,
    value: event.params.value,
  };

  context.MockUSDT_Approval.set(entity);
});

MockUSDT.FaucetClaimed.handler(async ({ event, context }) => {
  const entity: MockUSDT_FaucetClaimed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
  };

  context.MockUSDT_FaucetClaimed.set(entity);
});

MockUSDT.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: MockUSDT_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.MockUSDT_OwnershipTransferred.set(entity);
});

MockUSDT.Transfer.handler(async ({ event, context }) => {
  const entity: MockUSDT_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
  };

  context.MockUSDT_Transfer.set(entity);
});
