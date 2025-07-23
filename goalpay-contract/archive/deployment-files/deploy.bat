@echo off
echo 🚀 GoalFinance Deployment to Mantle Testnet
echo ============================================

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found!
    echo Please copy .env.example to .env and fill in your details
    pause
    exit /b 1
)

echo ✅ Environment file found

echo 🔨 Compiling contracts...
forge build

if %errorlevel% neq 0 (
    echo ❌ Compilation failed!
    pause
    exit /b 1
)

echo ✅ Compilation successful

echo 🧪 Running tests...
forge test

if %errorlevel% neq 0 (
    echo ❌ Tests failed!
    set /p continue="Continue with deployment anyway? (y/N): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
)

echo ✅ Tests passed

echo 🚀 Deploying to Mantle Testnet...
echo Make sure your .env file has PRIVATE_KEY and MANTLE_TESTNET_RPC_URL set!

REM Deploy (you'll need to set environment variables manually in Windows)
forge script script/DeployMantle.s.sol --rpc-url %MANTLE_TESTNET_RPC_URL% --private-key %PRIVATE_KEY% --broadcast

if %errorlevel% equ 0 (
    echo 🎉 Deployment successful!
    echo.
    echo 📋 Next steps:
    echo 1. Check the deployment output above for contract addresses
    echo 2. Update your frontend with the new addresses
    echo 3. Test the contracts on Mantle Testnet
    echo 4. Verify contracts manually if needed
    echo.
    echo 🌐 Mantle Testnet Explorer: https://explorer.testnet.mantle.xyz
    echo 💧 Get testnet MNT: https://faucet.testnet.mantle.xyz
) else (
    echo ❌ Deployment failed!
)

pause
