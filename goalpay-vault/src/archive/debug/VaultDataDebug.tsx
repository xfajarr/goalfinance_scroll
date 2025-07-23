import { useAccount, useChainId } from 'wagmi';
import { useGetTotalVaultCount, useGetAllVaults, useGetVaultsByCreator } from '@/hooks/useVaultReads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const VaultDataDebug = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: totalCount, isLoading: isLoadingCount, error: countError } = useGetTotalVaultCount();
  const { data: allVaults, isLoading: isLoadingAll, error: allError } = useGetAllVaults();
  const { data: userVaultIds, isLoading: isLoadingUser, error: userError } = useGetVaultsByCreator(address);

  return (
    <Card className="mt-4 bg-white/60 backdrop-blur-sm border-goal-border/30">
      <CardHeader>
        <CardTitle>Vault Data Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Chain Info</h3>
            <p className="text-sm text-blue-600">Chain ID: {chainId}</p>
            <p className="text-sm text-blue-600">Address: {address || 'Not connected'}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Total Vaults</h3>
            {isLoadingCount ? (
              <p className="text-sm text-green-600">Loading...</p>
            ) : countError ? (
              <p className="text-sm text-red-600">Error: {countError.message}</p>
            ) : (
              <p className="text-sm text-green-600">Count: {totalCount?.toString() || '0'}</p>
            )}
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">User Vaults</h3>
            {isLoadingUser ? (
              <p className="text-sm text-purple-600">Loading...</p>
            ) : userError ? (
              <p className="text-sm text-red-600">Error: {userError.message}</p>
            ) : (
              <p className="text-sm text-purple-600">
                IDs: {userVaultIds ? JSON.stringify(userVaultIds, (_key, value) =>
                  typeof value === 'bigint' ? value.toString() : value
                ) : 'None'}
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">All Vaults Data</h3>
          {isLoadingAll ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : allError ? (
            <p className="text-sm text-red-600">Error: {allError.message}</p>
          ) : (
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify(allVaults, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2
              )}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
