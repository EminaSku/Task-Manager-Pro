import React from "react";
import { Navigate } from "react-router-dom";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/tasks" replace />;
  return children;
}
