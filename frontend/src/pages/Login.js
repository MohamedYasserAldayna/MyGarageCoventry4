import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/login-register.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // Send login request
      const response = await axios.post(
        'http://localhost:5003/user/login',
        { email, password },
        { withCredentials: true } // Include cookies
      );

      const { role } = response.data;
      console.log('Login successful! Role:', role);

      setMessage('Login successful!');

      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'customer') {
        navigate('/customer-home'); // Redirect customer to homepage
      } else {
        setError('Unauthorized access. Invalid role.');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data || 'Error logging in. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2 className="page-title">Login</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
