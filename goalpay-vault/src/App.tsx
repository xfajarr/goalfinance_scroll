
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@/providers/PrivyProvider';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VaultDetail from "./pages/VaultDetail";
import CreateVault from "./pages/CreateVault";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import JoinVault from "./pages/JoinVault";
import Learn from "./pages/Learn";
import TestInviteCodes from "./pages/TestInviteCodes";
import TestIntegration from "./pages/TestIntegration";
import TestFindVault from "./pages/TestFindVault";
import TestJoinVault from "./pages/TestJoinVault";
import TestAddFunds from "./pages/TestAddFunds";
import TestSuite from "./pages/TestSuite";
import DebugVaultCreation from "./pages/DebugVaultCreation";
import VaultCreationV2 from "./pages/VaultCreationV2";
import TestVaultCreation from "./pages/TestVaultCreation";
import TestVaultOperations from "./pages/TestVaultOperations";
import NotFound from "./pages/NotFound";

const App = () => (
  <PrivyProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vault/:id" element={<VaultDetail />} />
          <Route path="/create-vault" element={<CreateVault />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/join/:id" element={<JoinVault />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/test-invite-codes" element={<TestInviteCodes />} />
          <Route path="/test-integration" element={<TestIntegration />} />
          <Route path="/test-find-vault" element={<TestFindVault />} />
          <Route path="/test-join-vault" element={<TestJoinVault />} />
          <Route path="/test-add-funds" element={<TestAddFunds />} />
          <Route path="/test-suite" element={<TestSuite />} />
          <Route path="/debug-vault-creation" element={<DebugVaultCreation />} />
          <Route path="/vault-creation-v2" element={<VaultCreationV2 />} />
          <Route path="/test-vault-creation" element={<TestVaultCreation />} />
          <Route path="/test-vault-operations" element={<TestVaultOperations />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PrivyProvider>
);

export default App;
