import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../pages/System/NotFound";
import Login from "../pages/System/Admin/Login/login";
import User from "../pages/System/Admin/User/User";
import Even from "../pages/System/Admin/Even/Even";
import Contact from "../pages/HomePage/Contact/Contact";
import ContactAdmin from "../pages/System/Admin/Contact/Contact";
import Request from "../pages/System/Admin/Request/Request";
// import Statistical from "../pages/System/Statistical/Statistical";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userInfo = localStorage.getItem("userInfo");
  const isAuthenticated = !!localStorage.getItem("authTokenLocalStorage");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(userInfo);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-found" />;
  }

  return children;
};

function AppRoutes({ setIsAuthenticated }) {
  const isAuthenticated = !!localStorage.getItem("authTokenLocalStorage");
  const userInfo = localStorage.getItem("userInfo");
  const user = isAuthenticated && userInfo ? JSON.parse(userInfo) : null;

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/contact-user"
        element={<Contact setIsAuthenticated={setIsAuthenticated} />}
      />

      {/* Authentication Routes */}
      {!isAuthenticated && (
        <>
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}

      {/* Admin Routes */}
      {user?.role === "admin" && (
        <>
        {/* <Route
            path="/statistical"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Statistical />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ContactAdmin />
              </ProtectedRoute>
            }
          />
        </>
      )}

      {/* Organizer Routes */}
      {user?.role === "organizer" && (
        <>
          <Route
            path="/quantitly-metting"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <Even />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <Request />
              </ProtectedRoute>
            }
          />
        </>
      )}

      {/* Catch-All Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
