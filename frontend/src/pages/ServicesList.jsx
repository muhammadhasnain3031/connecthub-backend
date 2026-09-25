import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';

// Day 9: Custom useDebounce Hook inline helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Cleanup previous timeout if user types again
    };
  }, [value, delay]);

  return debouncedValue;
};

const ServicesList = () => {
  // 1. Core States for Data
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // 3. Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 4. Apply Debounce to Search Input
  const debouncedSearch = useDebounce(search, 500);

  // 5. Reset Page to 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, minPrice, maxPrice]);

  // 6. Data Fetching Logic with Query Params
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Build dynamic query parameters string
        let queryParams = `?page=${page}&limit=6`;
        if (debouncedSearch) queryParams += `&search=${encodeURIComponent(debouncedSearch)}`;
        if (category) queryParams += `&category=${encodeURIComponent(category)}`;
        if (minPrice) queryParams += `&minPrice=${minPrice}`;
        if (maxPrice) queryParams += `&maxPrice=${maxPrice}`;

        const res = await axios.get(`http://localhost:5000/api/services${queryParams}`);
        
        // Match with the new backend response format
        setServices(res.data.services || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching services", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [debouncedSearch, category, minPrice, maxPrice, page]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h3>Available Services</h3>

      {/* --- FILTER CONTROL PANEL --- */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        
        {/* Search Input */}
        <input 
          type="text" 
          placeholder="Search by title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px', minWidth: '200px' }}
        />

        {/* Category Filter */}
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '8px' }}>
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Graphic Design">Graphic Design</option>
          <option value="Content Writing">Content Writing</option>
          <option value="Digital Marketing">Digital Marketing</option>
        </select>

        {/* Price Filters */}
        <input 
          type="number" 
          placeholder="Min Price" 
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: '8px', width: '100px' }}
        />
        <input 
          type="number" 
          placeholder="Max Price" 
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: '8px', width: '100px' }}
        />
      </div>

      {/* --- SERVICES RENDER AREA --- */}
      {loading ? (
        <p>Loading services...</p>
      ) : services.length === 0 ? (
        <p>No services found matching your criteria.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {services.map(service => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}

      {/* --- PAGINATION BUTTONS --- */}
      {totalPages > 1 && (
        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(prev => prev - 1)}
            style={{ padding: '8px 16px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          
          <span>Page {page} of {totalPages}</span>
          
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(prev => prev + 1)}
            style={{ padding: '8px 16px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
