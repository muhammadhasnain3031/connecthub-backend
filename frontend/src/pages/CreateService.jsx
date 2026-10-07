import React, { useState } from 'react';
import axios from 'axios';

const CreateService = () => {
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); 
      const res = await axios.post('http://localhost:5000/api/services', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Service Created Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating service');
    }
  };

  return (
    <div>
      <h3>Add New Service</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" onChange={e => setFormData({...formData, title: e.target.value})} required /><br/>
        <textarea placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} required /><br/>
        <input type="number" placeholder="Price" onChange={e => setFormData({...formData, price: e.target.value})} required /><br/>
        <input type="text" placeholder="Category" onChange={e => setFormData({...formData, category: e.target.value})} required /><br/>
        <button type="submit">Create Service</button>
      </form>
    </div>
  );
};

export default CreateService;
