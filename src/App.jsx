import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EmailConfirmation from "./pages/redirectpages/emailConfirmation";
import AdminDashboard from "./admin/adminDashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import RequireAuth from "./components/guards/RequireAuth";
import RequireAdmin from "./components/guards/RequireAdmin";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/home";
import TruckList from "./pages/allTrucks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TruckDetails from "./pages/Truckdetails";
import React from "react";
import Navbar from "./components/navbar";
import CircularFloatingMenu from "./components/CircularFloatingMenu";
import FloatingChat from "./components/floatchat";
import BackToTop from "./components/backtotop";
import FloatingWhatsAppLeft from "./components/FloatingWhatsAppLeft";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles/sweetalert-notifications.css";

// Initialize AOS
AOS.init({
  duration: 700,
  offset: 100,
  once: true,
  mirror: false,           // Disable reverse animation
  disable: window.innerWidth < 768 // Disable on mobile
});


function ProtectedAuth() {
  const { user, initialising } = useAuth();

  if (initialising) {
    return null; // or a loading spinner
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                <>
                <div style={{overflow: "hidden"}}>
                  <Navbar />
                  <Home />
                  <FloatingChat />
                  <FloatingWhatsAppLeft />
                  <BackToTop />
                </div>
                </>} />
              <Route path="/allTrucks" element={
                <>
                  <Navbar />
                  <div data-aos="fade-up">
                    <TruckList />
                  </div>
                  <FloatingChat />
                  <FloatingWhatsAppLeft />
                  <BackToTop />
                </>
                } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <div data-aos="fade-up">
                    <About />
                  </div>
                  <FloatingChat />
                  <FloatingWhatsAppLeft />
                  <BackToTop />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <div data-aos="fade-up">
                    <Contact />
                  </div>
                  <FloatingChat />
                  <FloatingWhatsAppLeft />
                  <BackToTop />
                </>
              } />
              <Route path="/trucks/:id" element={
                <>
                  <div data-aos="fade-up">
                    <TruckDetails />
                  </div>
                  <FloatingChat />
                  <FloatingWhatsAppLeft />
                  <BackToTop />
                </>
              } />
              <Route path="/Login" element={<ProtectedAuth />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <div data-aos="fade-up">
                      <Dashboard />
                    </div>
                  </RequireAuth>
                }
              />
              <Route
                path="/emailConfirmation"
                element={<EmailConfirmation />}
              />
              <Route
                path="/TrucksZoneSpecial"
                element={
                  <RequireAdmin>
                      <AdminDashboard />
                  </RequireAdmin>
                }
              />
            </Routes>
          </ErrorBoundary>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
