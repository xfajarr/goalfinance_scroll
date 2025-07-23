# Archive Folder

This folder contains legacy and unused files that have been moved from the main project directory to keep the codebase clean and organized.

## 📁 Folder Structure

### `/scripts/` - Legacy Deployment Scripts
- `DeployGoalFinance.s.sol` - Old V1 deployment script (replaced by `Deploy.s.sol`)
- `DeployMantle.s.sol` - Mantle-specific deployment script (replaced by universal `Deploy.s.sol`)
- `DeployMantleTest.s.sol` - Mantle test deployment script (replaced by universal `Deploy.s.sol`)

### `/docs/` - Legacy Documentation
- `CONTRACT_DOCUMENTATION.md` - V1 contract documentation (replaced by `NEW_CONTRACT_DOCUMENTATION.md`)
- `DEPLOYMENT_GUIDE.md` - Old deployment guide (replaced by `DEPLOYMENT_GUIDE_V2.md`)
- `README_GoalFinance.md` - Legacy README file (consolidated into main `README.md`)

### `/deployment-files/` - Legacy Deployment Files
- `deploy.bat` - Windows batch deployment script (replaced by Makefile commands)
- `deploy.sh` - Shell deployment script (replaced by Makefile commands)
- `GoalFinance_flattened.sol` - Flattened contract file (no longer needed)
- `DeployGoalFinance.s.sol/` - Legacy broadcast files (if any)

### `/examples-old/` - Old Example Files
- Reserved for any old example files that may be replaced

## 🔄 What Replaced These Files

### Current Active Files:
- **Deployment**: `script/Deploy.s.sol` - Universal deployment script for all chains
- **Documentation**: 
  - `NEW_CONTRACT_DOCUMENTATION.md` - Complete V2 contract documentation
  - `NEW_QUICK_REFERENCE.md` - Quick reference guide
  - `DEPLOYMENT_GUIDE_V2.md` - Universal deployment guide
  - `TEST_UPDATES_SUMMARY.md` - Test updates summary
- **Build System**: `Makefile` - Comprehensive build and deployment commands
- **Examples**: `examples/` folder with current examples

## 📅 Archive Date
Files archived on: $(date)

## ⚠️ Important Notes

1. **Do not delete** these files as they may contain useful reference information
2. **Check archive** before creating new files with similar names
3. **Legacy contracts** in this folder are for reference only and should not be deployed
4. **Old documentation** may contain outdated information - always refer to current docs

## 🔍 Finding Archived Content

If you need to reference old functionality:
1. Check the appropriate subfolder in this archive
2. Compare with current implementation in main project
3. Refer to git history for detailed changes

## 🧹 Cleanup Benefits

Moving these files to archive provides:
- ✅ **Cleaner project structure**
- ✅ **Reduced confusion** about which files to use
- ✅ **Better organization** of current vs legacy code
- ✅ **Preserved history** for reference
- ✅ **Easier navigation** for new developers

---

**Note**: This archive folder should be kept in version control for historical reference but excluded from active development workflows.
