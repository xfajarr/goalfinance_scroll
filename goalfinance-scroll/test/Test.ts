import assert from "assert";
import { 
  TestHelpers,
  AcornsVault_FundsDeposited
} from "generated";
const { MockDb, AcornsVault } = TestHelpers;

describe("AcornsVault contract FundsDeposited event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for AcornsVault contract FundsDeposited event
  const event = AcornsVault.FundsDeposited.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("AcornsVault_FundsDeposited is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await AcornsVault.FundsDeposited.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualAcornsVaultFundsDeposited = mockDbUpdated.entities.AcornsVault_FundsDeposited.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedAcornsVaultFundsDeposited: AcornsVault_FundsDeposited = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      user: event.params.user,
      token: event.params.token,
      amount: event.params.amount,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualAcornsVaultFundsDeposited, expectedAcornsVaultFundsDeposited, "Actual AcornsVaultFundsDeposited should be the same as the expectedAcornsVaultFundsDeposited");
  });
});
