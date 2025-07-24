
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@/providers/PrivyProvider';
import Layout from '@/components/Layout';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import GoalDetail from "./pages/VaultDetail";
import CreateGoal from "./pages/CreateVault";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import JoinGoal from "./pages/JoinVault";
import Learn from "./pages/Learn";
import GoalsHistory from "./pages/GoalsHistory";

import GoalCreationV2 from "./pages/VaultCreationV2";

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
            <Route path="/goal/:id" element={<GoalDetail />} />
            <Route path="/vault/:id" element={<GoalDetail />} />
            <Route path="/vault/tx/:txHash" element={<GoalDetail />} />
            <Route path="/create-goal" element={<CreateGoal />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/discover-circles" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/join/:id" element={<JoinGoal />} />
            <Route path="/join/tx/:txHash" element={<JoinGoal />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/goals-history" element={<GoalsHistory />} />
            <Route path="/goal-creation-v2" element={<GoalCreationV2 />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </PrivyProvider>
);

export default App;
