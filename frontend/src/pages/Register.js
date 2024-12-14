import React, { useState } from "react";
import axios from "axios";
import '../styles/login-register.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5003/user/register', {
                username,
                email,
                password,
                role,
                businessName
            }, {
                withCredentials: true,  // Include cookies for authentication
            });

            setMessage(response.data);  // Success message
        } catch (err) {
            setError(err.response?.data || 'Error registering user');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <div className="error">{error}</div>}
            {message && <div className="message">{message}</div>}

            <form onSubmit={handleRegister}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="role">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                        <option value="service_center">Service Center</option>
                        <option value="part_seller">Part Seller</option>
                    </select>
                </div>

                {role === 'service_center' && (
                    <div>
                        <label htmlFor="businessName">Business Name</label>
                        <input
                            type="text"
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                        />
                    </div>
                )}

                <div>
                    <button type="submit">Register</button>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;