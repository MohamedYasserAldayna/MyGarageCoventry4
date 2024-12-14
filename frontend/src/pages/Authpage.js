import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const AuthPage = () => {
    return (
        <div className="common-container">
            <h2>Welcome to MyGarage</h2>
            <p>Please choose an option below to get started:</p>
            <div className="auth-buttons">
                <Link to="/login">
                    <button className="auth-button">Login</button>
                </Link>
                <Link to="/register">
                    <button className="auth-button">Register</button>
                </Link>
            </div>
        </div>
    );
};

export default AuthPage;
