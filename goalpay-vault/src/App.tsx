
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PrivyProvider>
);

export default App;
