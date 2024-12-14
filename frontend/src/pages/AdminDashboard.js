import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    partTypeId: '',
    sellerId: '',
    carBrandId: '',
  });
  const [parts, setParts] = useState([]); // List of parts
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch parts when the component loads
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await axios.get('http://localhost:5003/parts', {
          withCredentials: true,
        });
        setParts(response.data); // Set the fetched parts
      } catch (err) {
        console.error('Error fetching parts:', err.response?.data || err.message);
        setError('Error fetching parts.');
      }
    };

    fetchParts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Add a new part
      await axios.post('http://localhost:5003/parts/add', formData, {
        withCredentials: true,
      });
      setMessage('Part added successfully!');

      // Update the parts list by adding the new part
      setParts((prevParts) => [...prevParts, { ...formData }]);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        partTypeId: '',
        sellerId: '',
        carBrandId: '',
      });
    } catch (err) {
      console.error('Error adding part:', err.response?.data || err.message);
      setError(err.response?.data || 'Error adding part.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>
      <p>Manage parts in the inventory.</p>

      {/* Add Part Form */}
      <form onSubmit={handleSubmit} className="dashboard-form">
        <label htmlFor="name">Part Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter part name"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter part description"
          required
        />

        <label htmlFor="price">Price</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Enter price"
          required
        />

        <label htmlFor="stock">Stock</label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Enter stock quantity"
          required
        />

        <label htmlFor="imageUrl">Image URL</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Enter image URL"
          required
        />

        <label htmlFor="partTypeId">Part Type ID</label>
        <input
          type="text"
          id="partTypeId"
          name="partTypeId"
          value={formData.partTypeId}
          onChange={handleChange}
          placeholder="Enter part type ID"
          required
        />

        <label htmlFor="sellerId">Seller ID</label>
        <input
          type="text"
          id="sellerId"
          name="sellerId"
          value={formData.sellerId}
          onChange={handleChange}
          placeholder="Enter seller ID"
          required
        />

        <label htmlFor="carBrandId">Car Brand ID</label>
        <input
          type="text"
          id="carBrandId"
          name="carBrandId"
          value={formData.carBrandId}
          onChange={handleChange}
          placeholder="Enter car brand ID"
          required
        />

        <button type="submit">Add Part</button>
      </form>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* List of Parts */}
      <h3>Existing Parts</h3>
      {parts.length === 0 ? (
        <p>No parts available. Add a new part to get started!</p>
      ) : (
        <table className="parts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Type ID</th>
              <th>Seller ID</th>
              <th>Car Brand ID</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, index) => (
              <tr key={index}>
                <td>{part.NAME}</td>
                <td>{part.DESCRIPTION}</td>
                <td>{part.PRICE}</td>
                <td>{part.STOCK}</td>
                <td>{part.PART_TYPE_ID}</td>
                <td>{part.SELLER_ID}</td>
                <td>{part.CAR_BRAND_ID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
