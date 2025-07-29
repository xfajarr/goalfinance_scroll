
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@/providers/PrivyProvider';
import LandingLayout from '@/components/layouts/LandingLayout';
import AppLayout from '@/components/layouts/AppLayout';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import PublicRoute from '@/components/routing/PublicRoute';
import RedirectRoute from '@/components/routing/RedirectRoute';


// Public pages
import Index from "./pages/Index"; // Original landing page
import Landing from "./pages/Landing"; // New marketing landing page
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";

// App pages (protected)
import Dashboard from "./pages/Dashboard";
import GoalDetail from "./pages/VaultDetail";
import CreateGoal from "./pages/CreateVault";
import Community from "./pages/Community";
import SplitBills from "./pages/SplitBills";
import Profile from "./pages/Profile";
import JoinGoal from "./pages/JoinVault";
import Learn from "./pages/Learn";
import Debts from "./pages/Debts";
import GoalsHistory from "./pages/GoalsHistory";
import FlashcardDemo from "./components/flashcard/FlashcardDemo";
import GoalCreationV2 from "./pages/VaultCreationV2";
import TestSlideAnimation from "./pages/TestSlideAnimation";

// Special pages
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";

const App = () => (
  <PrivyProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public routes - Original landing page with existing layout */}
          <Route path="/" element={
            <PublicRoute>
              <Index />
            </PublicRoute>
          } />

          {/* New marketing landing page */}
          <Route path="/landing" element={
            <LandingLayout>
              <Landing />
            </LandingLayout>
          } />

          <Route path="/how-it-works" element={
            <LandingLayout>
              <HowItWorks />
            </LandingLayout>
          } />

          <Route path="/faq" element={
            <LandingLayout>
              <FAQ />
            </LandingLayout>
          } />

          {/* Welcome page without Layout since it's a full-screen onboarding experience */}
          <Route path="/welcome" element={<Welcome />} />

          {/* Test page for slide animation */}
          <Route path="/test-slide" element={<TestSlideAnimation />} />

          {/* Protected app routes with AppLayout */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="goal/:id" element={<GoalDetail />} />
                  <Route path="vault/:id" element={<GoalDetail />} />
                  <Route path="vault/tx/:txHash" element={<GoalDetail />} />
                  <Route path="create-goal" element={<CreateGoal />} />
                  <Route path="discover-circles" element={<Community />} />
                  <Route path="split-bills" element={<SplitBills />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="join/:id" element={<JoinGoal />} />
                  <Route path="join/tx/:txHash" element={<JoinGoal />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="debts" element={<Debts />} />
                  <Route path="flashcard-demo" element={<FlashcardDemo />} />
                  <Route path="goals-history" element={<GoalsHistory />} />
                  <Route path="goal-creation-v2" element={<GoalCreationV2 />} />
                  {/* Catch-all for app routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Backward compatibility redirects */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/dashboard" />
            </ProtectedRoute>
          } />
          <Route path="/create-goal" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/create-goal" />
            </ProtectedRoute>
          } />
          <Route path="/goal/:id" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/goal/:id" />
            </ProtectedRoute>
          } />
          <Route path="/vault/:id" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/vault/:id" />
            </ProtectedRoute>
          } />
          <Route path="/vault/tx/:txHash" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/vault/tx/:txHash" />
            </ProtectedRoute>
          } />
          <Route path="/discover-circles" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/discover-circles" />
            </ProtectedRoute>
          } />
          <Route path="/split-bills" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/split-bills" />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/profile" />
            </ProtectedRoute>
          } />
          <Route path="/join/:id" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/join/:id" />
            </ProtectedRoute>
          } />
          <Route path="/join/tx/:txHash" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/join/tx/:txHash" />
            </ProtectedRoute>
          } />
          <Route path="/learn" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/learn" />
            </ProtectedRoute>
          } />
          <Route path="/debts" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/debts" />
            </ProtectedRoute>
          } />
          <Route path="/flashcard-demo" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/flashcard-demo" />
            </ProtectedRoute>
          } />
          <Route path="/goals-history" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/goals-history" />
            </ProtectedRoute>
          } />
          <Route path="/goal-creation-v2" element={
            <ProtectedRoute>
              <RedirectRoute to="/app/goal-creation-v2" />
            </ProtectedRoute>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PrivyProvider>
);

export default App;
