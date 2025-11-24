import { useState, useEffect } from "react";
import { 
  Truck, Gauge, Cog, Calendar, Navigation, 
  Fuel, ChevronLeft, ChevronRight, Check, 
  Phone, Mail, Share2, Heart, Play, ArrowLeft, 
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Truckdetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoad, faAnchor, faWeightHanging, faCircleCheck, faCar, faCalendarCheck, faTag, faComment } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { FaWhatsapp } from "react-icons/fa";

export function TruckDetailPage() {
  const {user} = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [relatedTrucks, setRelatedTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [RequestText, setRequestText] = useState('');
  const [openReq, setReq] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  const handleTruckRequest = async () => {
    const result = await Swal.fire({
      icon: "info",
      title: "Truck Request",
      text: "please enter your request text",
      input: "text",
      inputAutoFocus: true,
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Submit Request",
      confirmButtonColor: "red",
      cancelButtonText: "Cancel",
      cancelButtonColor: "black"
    });

    if (result.isConfirmed && result.value) {
      setRequestText(result.value);
      // Here you can handle the request submission
      await addToWishlist();
      setReq(false);
    } else {
      setReq(false);
    }
  };

  useEffect(() => {
    const fetchTruckDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch truck details with images
       const { data: truckData, error: truckError } = await supabase
          .from('trucks')
          .select(`
            *,
            truck_images(*),
            truck_videos(*)
          `)
          .eq('id', id)
          .single();

        if (truckError) throw truckError;

        // Fetch categories for this truck
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('truck_categories')
          .select(`
            categories (name)
          `)
          .eq('truck_id', id);

        if (categoriesError) throw categoriesError;

        // Fetch related trucks (same category)
        if (categoriesData.length > 0) {
          const { data: relatedData, error: relatedError } = await supabase
              .from('trucks')
              .select(`
                *,
                truck_images!inner(image_url)
              `)
              .neq('id', id)
              .limit(3);

          if (relatedError) throw relatedError;
          setRelatedTrucks(relatedData);
        }

        setTruck({
          ...truckData,
          categories: categoriesData.map(cat => cat.categories.name)
        });
      } catch (err) {
        setError('Failed to load truck details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTruckDetails();
    }
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const nextImage = () => {
    if (truck?.truck_images?.length) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % truck.truck_images.length
      );
    }
  };

  const prevImage = () => {
    if (truck?.truck_images?.length) {
      setCurrentImageIndex((prev) => 
        (prev - 1 + truck.truck_images.length) % truck.truck_images.length
      );
    }
  };

  // Lightbox functions
  const openLightbox = (index) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextLightboxImage = () => {
    if (truck?.truck_images?.length) {
      setLightboxImageIndex((prev) => 
        (prev + 1) % truck.truck_images.length
      );
    }
  };

  const prevLightboxImage = () => {
    if (truck?.truck_images?.length) {
      setLightboxImageIndex((prev) => 
        (prev - 1 + truck.truck_images.length) % truck.truck_images.length
      );
    }
  };

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'ArrowLeft') prevLightboxImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, truck?.truck_images?.length]);

  if (loading) {
    return (
      <div className="truck-detail-loading">
        <div className="loading-spinner">
        </div>
        <p>Loading truck details...</p>
      </div>
    );
  }

  if (error || !truck) {
    return (
      <div className="truck-detail-error">
        <p>{error || 'Truck not found'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          <ArrowLeft /> Back to Inventory
        </button>
      </div>
    );
  }


  const addToWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('TruckRequest')
        .insert({
          Truck_id: truck.id,
          user_id: user.user_id,
          Request_text: RequestText
        });

      if (error){ 
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please enter your request text",
        }); return}

        Swal.fire({
          icon: "success",
          text: "Request send successfully"
        })
    } catch (error) {
      // Error adding truck to wishlist
    }
  };

  const handleNavigate = () => {
    navigate("/dashboard", {
      state: 
      { 
        newValue: "chat",
        truckdata: {
          truckId: truck.id.substring(0, 8),
          truckModel: truck.model,
          truckBrand: truck.brand,
          truckImage: truck.truck_images?.[0]?.image_url || null
        }
      }
    });
  };

  return (
    <div className="truck-detail-page">
      {/* Back Button */}
      <div className="truck-detail-breadcrumb">
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <ChevronLeft /> Back to Inventory
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="truck-detail-main">
        <div className="container">
          <div className="truck-detail-grid">
            {/* Image Gallery */}
            <div className="truck-gallery">
              {/* Main Image */}
              <div className="main-image-container">
                {truck.truck_images?.length > 0 && truck.truck_images[currentImageIndex]?.image_url ? (
                  <img
                    src={truck.truck_images[currentImageIndex].image_url}
                    alt={`${truck.brand} ${truck.model}`}
                    className="main-image"
                    onClick={() => openLightbox(currentImageIndex)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <div className="image-placeholder">No Image Available</div>
                )}
                
                {/* Navigation Arrows */}
                {truck.truck_images?.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="nav-arrow prev-arrow"
                    >
                      <ChevronLeft />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="nav-arrow next-arrow"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {truck.truck_images?.length > 1 && (
                <div className="thumbnail-container">
                  {truck.truck_images.map((img, index) => (
                    img.image_url && (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      >
                        <img 
                          src={img.image_url} 
                          alt={`Thumbnail ${index + 1}`} 
                        />
                      </button>
                    )
                  ))}
                </div>
              )}

              {/* Video */}
              {truck.truck_videos?.length > 0 && (
                <div className="td-truck-video">
                  <h2 style={{marginBottom: '1rem', fontSize: '2rem', fontWeight: '700', borderBottom: '1px solid #ccc'}}>Walk Around Video</h2>
                  <video
                    src={truck.truck_videos[0].video_url}
                    controls
                    autoPlay
                    muted
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="td-truck-details">
              <div className="td-truck-header">
                <div>
                  <div className="td-truck-title">
                    <h1 className="td2-truck-title">{truck.brand} {truck.model}</h1>
                   
                      <button onClick={() => {
                        if(!user){
                          Swal.fire({
                            icon: 'error',
                            title: 'Please Login First',
                            text: 'You need to login to add this truck to your wishlist',
                           showConfirmButton: true, 
                           confirmButtonText: 'Login',
                           confirmButtonColor: "red",
                           showCancelButton: true,
                           cancelButtonColor: "black"
                          }).then((result) => {
                            if (result.isConfirmed) {
                              navigate('/Login');
                            }
                          })
                          return;
                        } 
                        handleTruckRequest()
                      }} className="td-req-button">i Want this Truck</button>
                 
                  </div>
                  <div className="truck-meta">
                    <span className="truck-year">{truck.year}</span>
                    <span className="truck-mileage">
                      {truck.mileage?.toLocaleString()} km
                    </span>
                    {truck.categories?.length > 0 && (
                      <span className="truck-category">
                        {truck.categories[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="price-section">
                {truck.discount_percent > 0 ? (
                  <>
                    <span className="original-price">
                      {formatPrice(truck.price)}
                    </span>
                    <span className="final-price">
                      {formatPrice(truck.final_price)}
                    </span>
                    <span className="discount-badge">
                      Save {truck.discount_percent}%
                    </span>
                  </>
                ) : (
                  <span className="final-price">
                    {formatPrice(truck.price)}
                  </span>
                )}
              </div>

              <div className="specs-grid">
                <div className="spec-item">
                  <Gauge className="spec-icon" />
                  <div>
                    <div className="spec-label">Horsepower</div>
                    <div className="spec-value">{truck.horsepower} HP</div>
                  </div>
                </div>
                <div className="spec-item">
                  <Truck className="spec-icon" />
                  <div>
                    <div className="spec-label">Towing</div>
                    <div className="spec-value">
                      {truck.towing_capacity?.toLocaleString()} kg
                    </div>
                  </div>
                </div>
                <div className="spec-item">
                  <Cog className="spec-icon" />
                  <div>
                    <div className="spec-label">Transmission</div>
                    <div className="spec-value">{truck.transmission}</div>
                  </div>
                </div>
                <div className="spec-item">
                  <Fuel className="spec-icon" />
                  <div>
                    <div className="spec-label">Engine</div>
                    <div className="spec-value">
                      {truck.engine_size}L {truck.engine_type}
                    </div>
                </div>
                </div>
                <div className="spec-item">
                  <FontAwesomeIcon icon={faRoad} className="spec-icon" />
                  <div>
                    <div className="spec-label">Mileage</div>
                    <div className="spec-value">{truck.mileage} km</div>
                  </div>
                </div>
                <div className="spec-item">
                  <FontAwesomeIcon icon={faAnchor} className="spec-icon" />
                  <div>
                    <div className="spec-label">Towing Capacity</div>
                    <div className="spec-value">{truck.towing_capacity} kg</div>
                  </div>
                </div>
                <div className="spec-item">
                  < FontAwesomeIcon icon={faCircleCheck} className="spec-icon" />
                  <div>
                    <div className="spec-label">Exterior Condition</div>
                    <div className="spec-value">{truck.exterior_condition}</div>
                  </div>
                </div>
                <div className="spec-item">
                  < FontAwesomeIcon icon={faCar} className="spec-icon" />
                  <div>
                    <div className="spec-label">Interior Condition</div>
                    <div className="spec-value">{truck.interior_condition}</div>
                  </div>
                </div>
                <div className="spec-item">
                  < FontAwesomeIcon icon={faCalendarCheck} className="spec-icon" />
                  <div>
                    <div className="spec-label">Availability</div>
                    <div className="spec-value">{truck.availability}</div>
                  </div>
                </div>
                <div className="spec-item">
                  < FontAwesomeIcon icon={faTag} className="spec-icon" />
                  <div>
                    <div className="spec-label">Model</div>
                    <div className="spec-value">{truck.model}</div>
                  </div>
                </div>
              </div>

              {truck.description && (
                <div className="description-section">
                  <h3>Description</h3>
                  <p>{truck.description}</p>
                </div>
              )}

              <div className="td-cta-buttons">
                <button className="td-primary-button" onClick={handleNavigate}>
                  <FontAwesomeIcon icon={faComment}/> Chat With Us
                </button>
                <button className="td-secondary-button">
                  <FaWhatsapp className="spec-icon"/> Contact Us on WhatsApp
                </button>
                <button className="td-tertiary-button">
                  Request More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Trucks */}
      {relatedTrucks.length > 0 && (
        <section className="related-trucks">
          <div className="container">
            <h2>Similar Trucks</h2>
            <div className="related-grid">
              {relatedTrucks.map((relatedTruck) => (
                <div 
                  key={relatedTruck.id} 
                  className="related-truck-card"
                  onClick={() => navigate(`/trucks/${relatedTruck.id}`)}
                >
                  <div className="related-truck-image">
                    {relatedTruck.truck_images?.[0]?.image_url ? (
                      <img 
                        src={relatedTruck.truck_images[0].image_url} 
                        alt={`${relatedTruck.brand} ${relatedTruck.model}`}
                      />
                    ) : (
                      <div className="image-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="related-truck-details">
                    <h3>{relatedTruck.brand} {relatedTruck.model}</h3>
                    <div className="related-truck-price">
                      {formatPrice(relatedTruck.final_price || relatedTruck.price)}
                    </div>
                    <div className="related-truck-specs">
                      <span>{relatedTruck.year}</span>
                      <span>•</span>
                      <span>{relatedTruck.mileage?.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <ChevronLeft />
            </button>
            
            {truck.truck_images?.length > 0 && truck.truck_images[lightboxImageIndex]?.image_url ? (
              <img
                src={truck.truck_images[lightboxImageIndex].image_url}
                alt={`${truck.brand} ${truck.model} - Image ${lightboxImageIndex + 1}`}
                className="lightbox-image"
              />
            ) : (
              <div className="image-placeholder">No Image Available</div>
            )}
            
            {truck.truck_images?.length > 1 && (
              <>
                <button 
                  onClick={prevLightboxImage}
                  className="lightbox-nav lightbox-prev"
                >
                  <ChevronLeft />
                </button>
                <button 
                  onClick={nextLightboxImage}
                  className="lightbox-nav lightbox-next"
                >
                  <ChevronRight />
                </button>
              </>
            )}
            
            {truck.truck_images?.length > 1 && (
              <div className="lightbox-counter">
                {lightboxImageIndex + 1} / {truck.truck_images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TruckDetailPage;