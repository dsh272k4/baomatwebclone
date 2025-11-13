// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role, requireAdmin = false }) {
  const token = localStorage.getItem("token");

  // Nếu chưa đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu admin nhưng role không hợp lệ
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Nếu đủ điều kiện → render component con
  return children;
}