import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthPage from './pages/Authpage.js';
import LoginPage from './pages/Login.js';
import RegisterPage from './pages/Register.js';
import AdminDashboard from './pages/AdminDashboard.js';

const App = () => {
  // Function to get the user's role from the JWT stored in cookies
  const getRole = () => {
    try {
      const token = document.cookie.split('; ').find((row) => row.startsWith('authToken='));
      if (!token) {
        console.warn('authToken not found in cookies');
        return null;
      }

      const jwtPayload = JSON.parse(atob(token.split('=')[1].split('.')[1])); // Decode JWT payload
      return jwtPayload.role || null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Retrieve the role once
  const role = getRole();
  console.log('User role:', role); // Debugging

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
          element={<AdminDashboard/>}
            
        />
      </Routes>
    </Router>
  );
};

export default App;

