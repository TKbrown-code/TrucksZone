import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './styles/FeaturedProduct.css';
import aos from "aos";
import "aos/dist/aos.css";

aos.init({
  duration: 700,
  offset: 100,
  once: true,
  mirror: false,           // Disable reverse animation
  disable: window.innerWidth < 768 // Disable on mobile
});

const FeaturedProduct = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllTrucks();
  }, []);

  const fetchAllTrucks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('trucks')
        .select(`
          *,
          truck_images (*)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTrucks(data || []);
      
      // Show success notification
      if (data && data.length > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Trucks Loaded',
          text: `Successfully loaded ${data.length} featured trucks!`,
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    } catch (err) {
      setError('Failed to load trucks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    Swal.fire({
      icon: 'info',
      title: 'View All Trucks',
      text: 'Redirecting to all trucks page...',
      timer: 2000,
      showConfirmButton: false,
      position: 'center'
    }).then(() => {
      window.location.href = '/allTrucks';
    });
  };

  const handleTruckClick = (truck) => {
    Swal.fire({
      icon: 'info',
      title: truck.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Brand:</strong> ${truck.brand}</p>
          <p><strong>Model:</strong> ${truck.model}</p>
          <p><strong>Year:</strong> ${truck.year}</p>
          <p><strong>Price:</strong> $${truck.price.toLocaleString()}</p>
          ${truck.discount_percent > 0 ? `<p><strong>Discount:</strong> ${truck.discount_percent}% off</p>` : ''}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'View Details',
      cancelButtonText: 'Close',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `/trucks/${truck.id}`;
      }
    });
  };

  if (loading) {
    return (
      <div className="fp-container">
        <div className="fp-trucks-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="fp-card fp-loading">
              <div className="fp-loading-spinner"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fp-container">
        <div className="fp-error-message">
          <p>Failed to load trucks. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (trucks.length === 0) {
    return (
      <div className="fp-container">
        <div className="fp-no-trucks">
          <p>No trucks available</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="fp-container">
      <div className="fp-header">
        <h2 className="fp-header-title" data-aos="fade-up" data-aos-duration="1500">Featured Trucks</h2>
        <p className="fp-header-subtitle" data-aos="fade-up" data-aos-duration="2000">Explore our featured trucks and find the perfect truck for your needs.</p>
      </div>
      <div className="fp-trucks-grid">
        {trucks.map(truck => {
          const primaryImage = truck.truck_images?.find(img => img.is_primary) || truck.truck_images?.[0];

          return (
            <div key={truck.id} className="fp-card" data-aos="float-up" data-aos-duration="2500">
              {primaryImage && (
                <div className="fp-card-image">
                  <img src={primaryImage.image_url} alt={truck.title} />
                </div>
              )}
              <div className="fp-card-content">
                <h3 className="fp-card-title">{truck.title}</h3>
                <div className="fp-card-price">
                  {truck.discount_percent > 0 ? (
                    <>
                      <span className="fp-final-price">${truck.final_price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="fp-price">${truck.price.toLocaleString()}</span>
                  )}
                </div>
                <div className="fp-card-details">
                <p className="fp-card-brand"><strong>Brand:</strong>  {truck.brand}</p>
                <p><strong>Model:</strong>  {truck.model}</p>
                <p><strong>Engine Type:</strong>  {truck.engine_type}</p>
                <p><strong>Year:</strong>  {truck.year}</p>
                </div>
                <Link to={`/trucks/${truck.id}`} className="fp-card-link">
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <div className="fp-view-all-container">
      <Link to="/allTrucks" className="fp-view-all">View All</Link>
      </div>
    </div>
  );
};

export default FeaturedProduct;
