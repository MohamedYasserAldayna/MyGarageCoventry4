import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/parts.css';
const AddPartPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [partTypeId, setPartTypeId] = useState('');
    const [sellerId, setSellerId] = useState('');
    const [carBrandId, setCarBrandId] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post(
                'http://localhost:5003/parts/add',
                {
                    name,
                    description,
                    price,
                    stock,
                    imageUrl,
                    partTypeId,
                    sellerId,
                    carBrandId
                },
                {
                    withCredentials: true
                }
            );
            setMessage('Part added successfully!');
            navigate('/dashboard'); // Redirect to another page after successful submission
        } catch (err) {
            setError(err.response?.data || 'Error adding part');
        }
    };

    return (
        <div className="add-part-container">
            <h2>Add New Part</h2>
            {error && <div className="error">{error}</div>}
            {message && <div className="message">{message}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Part Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="stock">Stock</label>
                    <input
                        type="number"
                        id="stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                        type="text"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="partTypeId">Part Type ID</label>
                    <input
                        type="text"
                        id="partTypeId"
                        value={partTypeId}
                        onChange={(e) => setPartTypeId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="sellerId">Seller ID</label>
                    <input
                        type="text"
                        id="sellerId"
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="carBrandId">Car Brand ID</label>
                    <input
                        type="text"
                        id="carBrandId"
                        value={carBrandId}
                        onChange={(e) => setCarBrandId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <button type="submit">Add Part</button>
                </div>
            </form>
        </div>
    );
};

export default AddPartPage;
