
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@/providers/PrivyProvider';
import Layout from '@/components/Layout';
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

import VaultCreationV2 from "./pages/VaultCreationV2";

import NotFound from "./pages/NotFound";

const App = () => (
  <PrivyProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goal/:id" element={<VaultDetail />} />
            <Route path="/create-goal" element={<CreateVault />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/discover-circles" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/join/:id" element={<JoinVault />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/goal-creation-v2" element={<VaultCreationV2 />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </PrivyProvider>
);

export default App;
