import React from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import './TruckDetails.css';

const TruckDetails = ({ truck }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const extractStoragePath = (url, bucket) => {
    const parts = url.split(`/public/${bucket}/`);
    return parts[1];
  };

  const deleteImage = async (imageId, imageUrl) => {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: "This action cannot be undone!",
      icon: 'warning',
      overlay: 2000,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Extract storage path from URL
        const storagePath = extractStoragePath(imageUrl, 'truck_images');

        // Delete from storage
        await supabase.storage.from('truck_images').remove([storagePath]);

        // Delete from database
        const { error } = await supabase
          .from('truck_images')
          .delete()
          .eq('id', imageId);

        if (error) throw error;

        await Swal.fire(
          'Deleted!',
          'Image has been deleted.',
          'success'
        );

        // Refresh the page to update the view
        window.location.reload();
      } catch (error) {
        console.error('Error deleting image:', error);
        await Swal.fire(
          'Error',
          'Failed to delete the image.',
          'error'
        );
      }
    }
  };

  const deleteVideo = async (videoId, videoUrl) => {
    const result = await Swal.fire({
      title: 'Delete Video?',
      text: "This action cannot be undone!",
      icon: 'warning',
      overlay: true,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Extract storage path from URL
        const storagePath = extractStoragePath(videoUrl, 'truck_videos');

        // Delete from storage
        await supabase.storage.from('truck_videos').remove([storagePath]);

        // Delete from database
        const { error } = await supabase
          .from('truck_videos')
          .delete()
          .eq('id', videoId);

        if (error) throw error;

        await Swal.fire(
          'Deleted!',
          'Video has been deleted.',
          'success'
        );

        // Refresh the page to update the view
        window.location.reload();
      } catch (error) {
        console.error('Error deleting video:', error);
        await Swal.fire(
          'Error',
          'Failed to delete the video.',
          'error'
        );
      }
    }
  };

  return (
    <div className="truck-details">
      <div className="details-header">
        <h2>{truck.title}</h2>
        <div className="price-section">
          <span className="price">{formatCurrency(truck.price)}</span>
          {truck.discount_percent && (
            <span className="discount">({truck.discount_percent}% off)</span>
          )}
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h3>Basic Information</h3>
          <table className="details-table">
            <tbody>
              <tr>
                <td><strong>Title:</strong></td>
                <td>{truck.title}</td>
              </tr>
              <tr>
                <td><strong>Brand:</strong></td>
                <td>{truck.brand}</td>
              </tr>
              <tr>
                <td><strong>Model:</strong></td>
                <td>{truck.model}</td>
              </tr>
              <tr>
                <td><strong>Year:</strong></td>
                <td>{truck.year}</td>
              </tr>
              <tr>
                <td><strong>Type:</strong></td>
                <td>{truck.type}</td>
              </tr>
              <tr>
                <td><strong>Availability:</strong></td>
                <td>{truck.availability}</td>
              </tr>
              <tr>
                <td><strong>Created:</strong></td>
                <td>{formatDate(truck.created_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="details-section">
          <h3>Engine & Performance</h3>
          <table className="details-table">
            <tbody>
              <tr>
                <td><strong>Engine Size:</strong></td>
                <td>{truck.engine_size || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Engine Type:</strong></td>
                <td>{truck.engine_type || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Horsepower:</strong></td>
                <td>{truck.horsepower ? `${truck.horsepower} HP` : 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Torque:</strong></td>
                <td>{truck.torque ? `${truck.torque} lb-ft` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="details-section">
          <h3>Details</h3>
          <table className="details-table">
            <tbody>
              <tr>
                <td><strong>Transmission:</strong></td>
                <td>{truck.transmission || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Mileage:</strong></td>
                <td>{truck.mileage ? `${truck.mileage.toLocaleString()} miles` : 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Previous Owners:</strong></td>
                <td>{truck.previous_owners || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Towing Capacity:</strong></td>
                <td>{truck.towing_capacity ? `${truck.towing_capacity.toLocaleString()} lbs` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="details-section">
          <h3>Condition</h3>
          <table className="details-table">
            <tbody>
              <tr>
                <td><strong>Exterior:</strong></td>
                <td>{truck.exterior_condition || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Interior:</strong></td>
                <td>{truck.interior_condition || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Tires:</strong></td>
                <td>{truck.tire_condition || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {truck.truck_images && truck.truck_images.length > 0 && (
        <div className="media-section">
          <h3>Images ({truck.truck_images.length})</h3>
          <div className="images-grid">
            {truck.truck_images.map((image, index) => (
              <div key={image.id} className="image-item">
                <img
                  src={image.image_url}
                  alt={`Truck image ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                    e.target.alt = 'Image not available';
                  }}
                  loading="lazy"
                />
                {image.is_primary && <span className="primary-badge">Primary</span>}
                <button
                  onClick={() => deleteImage(image.id, image.image_url)}
                  className="delete-media-btn"
                  title="Delete this image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {truck.truck_videos && truck.truck_videos.length > 0 && (
        <div className="media-section">
          <h3>Videos ({truck.truck_videos.length})</h3>
          <div className="videos-list">
            {truck.truck_videos.map((video, index) => (
              <div key={video.id} className="video-item">
                <video controls preload="metadata">
                  <source src={video.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p>{video.type || `Video ${index + 1}`}</p>
                <button
                  onClick={() => deleteVideo(video.id, video.video_url)}
                  className="delete-media-btn"
                  title="Delete this video"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckDetails;
