import React from 'react';

const ServiceCard = ({ service }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>
      <h4>{service.title}</h4>
      <p>{service.description}</p>
      <p><b>Category:</b> {service.category}</p>
      <p style={{ color: 'green', fontWeight: 'bold' }}>Price: ${service.price}</p>
    </div>
  );
};

export default ServiceCard;
