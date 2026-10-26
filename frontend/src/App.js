import "@/App.css";
import { BrowserRouter, Navigate as RouterNavigate, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Welcome from "@/components/Welcome";
import Register from "@/components/Register";
import Login from "@/components/Login";
import RoleDashboard from "@/pages/RoleDashboard";
import Learn from "@/pages/Learn";
import Connect from "@/pages/Connect";
import ProfessionalDirectory from "@/pages/ProfessionalDirectory";
import Support from "@/pages/Support";
import Include from "@/pages/Include";
import Empower from "@/pages/Empower";
import Profile from "@/pages/Profile";
import Lesson from "@/pages/Lesson";
import ClubChat from "@/pages/ClubChat";

function AuthenticationRequired({ children }) {
  const { authStatus } = useApp();
  const location = useLocation();

  if (authStatus === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking your secure session…</div>;
  }
  if (authStatus !== "authenticated") {
    return <RouterNavigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // This only controls client navigation; the backend validates the session.
  return children;
}

function ApplicationRoutes() {
  return (
    <AuthenticationRequired>
      <Layout>
        <Routes>
          <Route path="/" element={<RoleDashboard />} />
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/dashboard/:role" element={<RoleDashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<Lesson />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/connect/club/:id" element={<ClubChat />} />
          <Route path="/navigate" element={<ProfessionalDirectory />} />
          <Route path="/support" element={<Support />} />
          <Route path="/include" element={<Include />} />
          <Route path="/empower" element={<Empower />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </AuthenticationRequired>
  );
}

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ApplicationRoutes />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;
