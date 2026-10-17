import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, minPrice, maxPrice]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let queryParams = `?page=${page}&limit=6`;
        if (debouncedSearch) queryParams += `&search=${encodeURIComponent(debouncedSearch)}`;
        if (category) queryParams += `&category=${encodeURIComponent(category)}`;
        if (minPrice) queryParams += `&minPrice=${minPrice}`;
        if (maxPrice) queryParams += `&maxPrice=${maxPrice}`;

        const res = await axios.get(`https://connecthub-backend-three.vercel.app/api/services${queryParams}`);
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
    <div className="page">
      <h1 className="page-title">Available Services</h1>
      <p className="page-sub">Apni pasand ki service dhoondo aur book karo</p>

      <div className="filters">
        <input className="input" type="text" placeholder="🔍 Search by title..."
          value={search} onChange={(e) => setSearch(e.target.value)} />

        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Graphic Design">Graphic Design</option>
          <option value="Content Writing">Content Writing</option>
          <option value="Digital Marketing">Digital Marketing</option>
        </select>

        <input className="input small" type="number" placeholder="Min Price"
          value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className="input small" type="number" placeholder="Max Price"
          value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="empty">😕 No services found matching your criteria.</div>
      ) : (
        <div className="grid">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesList;