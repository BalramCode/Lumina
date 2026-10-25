import "@/App.css";
import { BrowserRouter, Navigate as RouterNavigate, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Welcome from "@/components/Welcome";
import Register from "@/components/Register";
import Login from "@/components/Login";
import Dashboard from "@/pages/Dashboard";
import Learn from "@/pages/Learn";
import Connect from "@/pages/Connect";
import Navigate from "@/pages/Navigate";
import Support from "@/pages/Support";
import Include from "@/pages/Include";
import Empower from "@/pages/Empower";
import Profile from "@/pages/Profile";
import Lesson from "@/pages/Lesson";
import ClubChat from "@/pages/ClubChat";

function AuthenticationRequired({ children }) {
  // A server-issued session will replace this guard when login is implemented.
  // Browser state and a selected role are not treated as authentication.
  return <RouterNavigate to="/login" replace />;
}

function ApplicationRoutes() {
  return (
    <AuthenticationRequired>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<Lesson />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/connect/club/:id" element={<ClubChat />} />
          <Route path="/navigate" element={<Navigate />} />
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
