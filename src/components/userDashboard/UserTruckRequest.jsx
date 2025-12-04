import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faCalendarAlt, 
  faDollarSign, 
  faInfoCircle, 
  faSpinner, 
  faExclamationTriangle, 
  faImage, 
  faChevronLeft, 
  faChevronRight,
  faPlay,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/UserTruckRequest.css';
import { useLocation, useNavigate } from 'react-router-dom';

function UserTruckRequest() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [truckDetails, setTruckDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isMobileListExpanded, setIsMobileListExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('TruckRequest')
        .select(`
          *,
          trucks (
            id,
            title,
            brand,
            model,
            year,
            price,
            final_price,
            availability
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
      
      // If there are requests, select the first one by default
      if (data && data.length > 0) {
        handleRequestSelect(data[0]);
      }
    } catch (err) {
      setError('Failed to load truck requests');
    } finally {
      setLoading(false);
    }
  };

const handleRequestSelect = async (request) => {
  setSelectedRequest(request);
  setCurrentImageIndex(0);
  setShowLightbox(false);
  
  if (request?.trucks) {
    // Truck details loaded
    setTruckDetails(request.trucks);
    
    try {
      // Fetch all images for the truck
      const { data: imagesData, error: imagesError } = await supabase
        .from('truck_images')
        .select('image_url, is_primary')
        .eq('truck_id', request.trucks.id)
        .order('is_primary', { ascending: false });

      if (imagesError) {
        throw imagesError;
      }

      // Images data fetched

      if (imagesData?.length > 0) {
        const formattedImages = imagesData.map(img => ({
          url: img.image_url, // Use the URL directly from the database
          isPrimary: img.is_primary
        }));
        
        setImages(formattedImages);
      } else {
        // No images found for truck
        setImages([]);
      }
      
      // Fetch all videos for the truck with more details
      const { data: videosData, error: videosError } = await supabase
        .from('truck_videos')
        .select('id, video_url, created_at')
        .eq('truck_id', request.trucks.id)
        .order('created_at', { ascending: false });

      if (videosError) {
        throw videosError;
      }

      // Videos data fetched

      if (videosData?.length > 0) {
        // Create an array of video objects with unique IDs
        const uniqueVideos = [];
        const seenUrls = new Set();
        
        videosData.forEach(video => {
          if (!seenUrls.has(video.video_url)) {
            uniqueVideos.push({
              id: video.id,
              url: video.video_url,
              createdAt: video.created_at
            });
            seenUrls.add(video.video_url);
          } else {
            // Skipping duplicate video URL
          }
        });
        
        // Unique videos processed
        setVideos(uniqueVideos);
      } else {
        // No videos found for truck
        setVideos([]);
      }
    } catch (err) {
      setError('Failed to load media files.');
    }
  }
};

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="truck-request-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading your truck requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="truck-request-error">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
        <p>{error}</p>
        <button onClick={fetchUserRequests} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="truck-request-container">
      <h2 className="truck-request-title">
        <FontAwesomeIcon icon={faTruck} className="title-icon" />
        My Truck Wishlist
      </h2>
      
      <div className="truck-request-layout">
        <div className="ut-request-list">
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileListExpanded(!isMobileListExpanded)}
          >
            <span>My Requests ({requests.length})</span>
            <FontAwesomeIcon icon={isMobileListExpanded ? faChevronLeft : faChevronRight} />
          </button>
          
          <div className={`request-list ${isMobileListExpanded ? 'expanded' : 'collapsed'}`}>
            {requests.length === 0 ? (
              <div className="no-requests">
                <p>You haven't made any truck requests yet.</p>
              </div>
            ) : (
              requests.map((request) => (
                <div 
                  key={request.id}
                  className={`request-card ${selectedRequest?.id === request.id ? 'active' : ''}`}
                  onClick={() => {
                    handleRequestSelect(request);
                    setIsMobileListExpanded(false); // Close list on mobile after selection
                  }}
                >
                  <div className="request-card-header">
                    <span className="request-id">Request #{request.id}</span>
                    <span className={`status-badge ${request.trucks?.availability?.toLowerCase()}`}>
                      {request.trucks?.availability || 'N/A'}
                    </span>
                  </div>
                  <div className="request-truck-info">
                    <h4>{request.trucks?.title || 'Truck'}</h4>
                    <p>{request.trucks?.brand} {request.trucks?.model} • {request.trucks?.year}</p>
                  </div>
                  <div className="request-date">
                    <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                    {formatDate(request.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="request-details">
          {selectedRequest ? (
            <>
              <div className="truck-media">
                {images.length > 0 ? (
                  <div className="media-gallery">
                    <div className="main-media">
                      {images[currentImageIndex] && (
                        <div className="main-image-container" onClick={() => images.length > 0 && setShowLightbox(true)}>
                          <img 
                            src={images[currentImageIndex].url} 
                            alt={`${truckDetails?.brand} ${truckDetails?.model} - ${currentImageIndex + 1} of ${images.length}`}
                            className="truck-primary-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/path/to/placeholder-image.jpg';
                            }}
                          />
                          <div className="media-overlay">
                            <span>Click to view fullscreen</span>
                          </div>
                          {images.length > 1 && (
                        <div className="carousel-navigation">
                          <button 
                            className="carousel-btn carousel-btn-prev" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          <div className="carousel-counter">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                          <button 
                            className="carousel-btn carousel-btn-next"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                        </div>
                      )}
                        </div>
                      )}
                    </div>
                    
                    {images.length > 1 && (
                      <div className="thumbnail-container">
                        {images.map((img, index) => (
                          <div 
                            key={index} 
                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img 
                              src={img.url} 
                              alt={`Thumbnail ${index + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/path/to/placeholder-thumb.jpg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {videos.length > 0 && (
                      <div className="videos-container">
                        <h4>Videos</h4>
                        <div className="video-thumbnails">
                          {videos.map((video, index) => (
                            <div key={index} className="video-thumbnail">
                              <video 
                                key={video.id || index}
                                controls 
                                className="video-player"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'video-error';
                                  errorDiv.innerHTML = `
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                    <p>Failed to load video</p>
                                    <a href="${video.url}" target="_blank" rel="noopener noreferrer" className="video-link">
                                      Try opening in new tab
                                    </a>
                                  `;
                                  e.target.parentNode.replaceWith(errorDiv);
                                }}
                              >
                                <source src={video.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-media">
                    <FontAwesomeIcon icon={faImage} size="3x" />
                    <p>No media available for this truck</p>
                  </div>
                )}
                
                {/* Lightbox */}
                {showLightbox && images.length > 0 && (
                  <div className="lightbox" onClick={() => setShowLightbox(false)}>
                    <button className="close-lightbox" onClick={(e) => {
                      e.stopPropagation();
                      setShowLightbox(false);
                    }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                      <img 
                        src={images[currentImageIndex].url} 
                        alt={`Fullscreen ${currentImageIndex + 1} of ${images.length}`}
                      />
                      {images.length > 1 && (
                        <div className="lightbox-carousel-navigation">
                          <button 
                            className="lightbox-carousel-btn lightbox-carousel-btn-prev"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} size="2x" />
                          </button>
                          <span className="lightbox-carousel-counter">
                            {currentImageIndex + 1} / {images.length}
                          </span>
                          <button 
                            className="lightbox-carousel-btn lightbox-carousel-btn-next"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
                            }}
                          >
                            <FontAwesomeIcon icon={faChevronRight} size="2x" />
                          </button>
                        </div>  
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="truck-details">
                <h3>{truckDetails?.title || 'Truck Details'}</h3>
                <div className="detail-row">
                  <span className="detail-label">Brand:</span>
                  <span className="detail-value">{truckDetails?.brand || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Model:</span>
                  <span className="detail-value">{truckDetails?.model || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Year:</span>
                  <span className="detail-value">{truckDetails?.year || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value price">
                    ${truckDetails?.final_price?.toLocaleString() || 'N/A'}
                    {truckDetails?.discount_percent > 0 && (
                      <span className="original-price">
                        ${truckDetails?.price?.toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Availability:</span>
                  <span className={`status-badge ${truckDetails?.availability?.toLowerCase()}`}>
                    {truckDetails?.availability || 'N/A'}
                  </span>
                </div>
              </div>
              
              {selectedRequest.request_text && (
                <div className="request-notes">
                  <h4>Your Request Notes</h4>
                  <p>{selectedRequest.request_text}</p>
                </div>
              )}
              
              <div className="request-actions">
                <button className="btn primary" onClick={() => navigate(`/trucks/${truckDetails?.id}`)}>
                  <FontAwesomeIcon icon={faInfoCircle} /> View Full Details
                </button>
                <button className="btn secondary">
                  Contact Support
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <FontAwesomeIcon icon={faInfoCircle} size="3x" />
              <p>Select a truck request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserTruckRequest;