import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
      } catch (err) {
        console.error("Error fetching services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h3>Available Services</h3>
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        services.map(service => (
          <ServiceCard key={service._id} service={service} />
        ))
      )}
    </div>
  );
};

export default ServicesList;
