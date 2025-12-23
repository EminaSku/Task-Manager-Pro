import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import Admin from "./pages/Admin";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "ADMIN") return <Navigate to="/tasks" replace />;
    return children;
  } catch {
    return <Navigate to="/tasks" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <Tasks />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}
