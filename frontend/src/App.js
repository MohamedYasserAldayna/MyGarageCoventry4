import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/Authpage.js';
import LoginPage from './pages/Login.js';
import RegisterPage from './pages/Register.js';
import AdminDashboard from './pages/AdminDashboard.js'; // Admin Dashboard Page

const App = () => {
  // Function to check if the logged-in user is an admin
  const getRole = () => {
    const token = document.cookie.split('; ').find((row) => row.startsWith('authToken='));
    if (token) {
      try {
        // Decode the JWT payload
        const jwtPayload = JSON.parse(atob(token.split('=')[1].split('.')[1]));
        return jwtPayload.role; // Return the role from the JWT payload
      } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
      }
    }
    return null;
  };

  const role = getRole(); // Get the user's role

  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Register Page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Dashboard - Protected Route */}
        <Route
          path="/admin-dashboard"
          element={
            role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace={true} /> // Redirect non-admins to Auth page
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
