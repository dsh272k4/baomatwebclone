// secure-frontend/src/App.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import Logs from "./pages/Logs";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile"; // 1. IMPORT COMPONENT MỚI

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  return (
    <BrowserRouter>
      <Navbar role={role} setRole={setRole} />

      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<h2 style={{ padding: 40 }}>🏠 Welcome</h2>} />
        <Route path="/login" element={<Login setRole={setRole} />} />
        <Route path="/terms" element={<Terms />} />

        {/* === 2. THÊM ROUTE CHO PROFILE === */}
        {/* Yêu cầu đăng nhập, không cần admin */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute role={role}>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* ================================== */}

        {/* Khu vực admin (yêu cầu admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={role} requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute role={role} requireAdmin>
              <Logs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
} 
