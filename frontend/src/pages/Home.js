import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const CustomerHomePage = () => {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch parts from the backend
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await axios.get('http://localhost:5003/parts', { withCredentials: true });
        setParts(response.data);
        setFilteredParts(response.data); // Initialize filtered parts
      } catch (err) {
        console.error('Error fetching parts:', err.response?.data || err.message);
        setError('Failed to load parts.');
      }
    };

    fetchParts();
  }, []);

  // Add a part to the cart
  const addToCart = async (productId) => {
    try {
      await axios.post(
        'http://localhost:5003/cart/add',
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      setCartMessage('Part added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err.response?.data || err.message);
      setError('Failed to add part to cart.');
    }
  };

  // Filter parts based on search query
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = parts.filter(
      (part) =>
        part.NAME.toLowerCase().includes(query) ||
        part.DESCRIPTION.toLowerCase().includes(query)
    );
    setFilteredParts(filtered);
  };

  return (
    <div className="customer-home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="navbar-brand">MyGarage</h1>
        <ul className="navbar-links">
          <li>
            <Link to="/customer-home">Home</Link>
          </li>
          <li>
            <Link to="/cart">Cart</Link>
          </li>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </nav>

      <h2>Browse Parts</h2>
      {error && <div className="error">{error}</div>}
      {cartMessage && <div className="success">{cartMessage}</div>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for parts..."
        />
      </div>

      {filteredParts.length === 0 ? (
        <p>No parts match your search criteria.</p>
      ) : (
        <div className="parts-list">
          {filteredParts.map((part) => (
            <div key={part.ID} className="part-item">
              <h3>{part.NAME}</h3>
              <p>{part.DESCRIPTION}</p>
              <p>Price: ${part.PRICE}</p>
              <p>Stock: {part.STOCK}</p>
              <button onClick={() => addToCart(part.ID)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerHomePage;
