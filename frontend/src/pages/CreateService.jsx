import React, { useState } from 'react';
import axios from 'axios';

const CreateService = () => {
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/services', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Service Created Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating service');
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ marginTop: 0 }}>Add New Service</h3>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title</label>
          <input className="input" type="text" placeholder="Service title"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" placeholder="Service ke baare mein likho"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
        </div>
        <div className="field">
          <label>Price</label>
          <input className="input" type="number" placeholder="50"
            onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
        </div>
        <div className="field">
          <label>Category</label>
          <input className="input" type="text" placeholder="Web Development"
            onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
        </div>
        <button type="submit" className="btn">Create Service</button>
      </form>
    </div>
  );
};

export default CreateService;