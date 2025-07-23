# Archive Folder

This folder contains debug files, test files, and unused components that have been moved from the main project directory to keep the codebase clean and organized.

## 📁 Folder Structure

### `/debug/` - Debug Components
- `ContractDebug.tsx` - Contract debugging component with real-time contract state
- `VaultDataDebug.tsx` - Vault data debugging component with detailed vault information

### `/test/` - Test Files
- `setup.ts` - Vitest test setup configuration
- `mockData.ts` - Mock data for testing

### `/pages/` - Debug/Test Pages
- `DebugVaultCreation.tsx` - Debug page for testing vault creation functionality
- `TestContractInteraction.tsx` - Test page for contract interactions
- `TestTokenApproval.tsx` - Test page for token approval flows
- `TestVaultCreation.tsx` - Test page for vault creation
- `TestVaultJoining.tsx` - Test page for vault joining functionality

### `/components/` - Debug Components
- `TokenSetupDebug.tsx` - Token setup debugging component

### `/utils/` - Test Utilities
- `__tests__/` - Unit test files for utility functions

### Root Files
- `test-contract-connection.ts` - Contract connection testing utility

## 🔄 What Replaced These Files

### Current Active Files:
- **Main Components**: All production components are in `/src/components/`
- **Pages**: All production pages are in `/src/pages/`
- **Hooks**: All production hooks are in `/src/hooks/`
- **Utils**: All production utilities are in `/src/utils/`

## 📅 Archive Date
Files archived on: January 23, 2025

## ⚠️ Important Notes

1. **Do not delete** these files as they may contain useful debugging information
2. **Check archive** before creating new files with similar names
3. **Debug components** in this folder are for reference only and should not be imported in production
4. **Test files** may contain outdated test patterns - always refer to current testing practices

## 🔍 Using Archived Debug Components

If you need to use debug components for troubleshooting:

1. **Temporarily copy** the component back to the main components folder
2. **Import and use** in your development environment
3. **Remove** after debugging is complete
4. **Do not commit** debug components to production

## 🧪 Test Files

The archived test files include:
- Unit tests for utility functions
- Integration tests for contract interactions
- Mock data and test helpers
- Vitest setup configuration

## 🧹 Cleanup Benefits

Moving these files to archive provides:
- ✅ **Cleaner codebase** - Easier to navigate main project
- ✅ **Better organization** - Clear separation of production vs debug code
- ✅ **Preserved history** - Debug tools available when needed
- ✅ **Reduced bundle size** - Debug components not included in production builds
- ✅ **Improved performance** - Faster builds and hot reloads

## 🔧 Accessing Debug Tools

To temporarily use debug tools:

```bash
# Copy debug component back temporarily
cp src/archive/debug/VaultDataDebug.tsx src/components/debug/

# Use in your component
import { VaultDataDebug } from '@/components/debug/VaultDataDebug';

# Remember to remove after debugging
rm src/components/debug/VaultDataDebug.tsx
```

## 📝 Notes for Developers

- **Debug components** contain comprehensive logging and state inspection
- **Test files** include examples of contract interaction patterns
- **Mock data** can be useful for frontend development without blockchain
- **Utility tests** show expected behavior patterns

## 🚀 Production Readiness

With these files archived, the main codebase is now:
- ✅ Production-ready
- ✅ Clean and organized
- ✅ Free of debug/test clutter
- ✅ Optimized for performance
- ✅ Easy to maintain and extend
