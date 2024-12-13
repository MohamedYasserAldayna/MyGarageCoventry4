import React from 'react';
import '../styles/Navbar.css'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">MyGarage</div>
      <ul className="nav-links">
        <li><a href="#new-arrivals">New Arrivals</a></li>
        <li><a href="#trending">Trending</a></li>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
