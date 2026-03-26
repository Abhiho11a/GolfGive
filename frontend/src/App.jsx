// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ScoresPage from './pages/ScoresPage'
import CharitiesPage from './pages/CharitiesPage'
import DrawPage from './pages/DrawPage'
import PricingPage from './pages/PricingPage'
// import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import { useState } from 'react'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// Layout wrapper (with navbar + footer)
function Layout({ children, noFooter = false }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  )
}
function RoleBasedDashboard() {
  const { user, loading } = useAuth();
 const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedUser?.role === "admin";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return isAdmin ? <UserDashboard /> : <DashboardPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Layout noFooter><LoginPage /></Layout>} />
      <Route path="/signup" element={<Layout noFooter><SignupPage /></Layout>} />
      <Route path="/charities" element={<Layout><CharitiesPage /></Layout>} />
      <Route path="/draw" element={<Layout><DrawPage /></Layout>} />
      <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />

      {/* Protected user routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <RoleBasedDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/scores" element={
        <ProtectedRoute>
          <Layout><ScoresPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/charity" element={
        <ProtectedRoute>
          <Layout><CharitiesPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="noise">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}