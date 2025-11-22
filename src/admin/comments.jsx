import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useModal } from '../contexts/ModalContext';
import CommentsForm from './commentsform';
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import "./comments.css";

const Comments = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 10;
  const { showModal } = useModal();

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * reviewsPerPage;
      const to = from + reviewsPerPage - 1;

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          trucks (
            title,
            truck_images (*)
          )
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      setTotalPages(Math.ceil((count || 0) / reviewsPerPage));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const deleteReview = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await Swal.fire(
          'Deleted!',
          'The review has been deleted successfully.',
          'success'
        );

        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      await Swal.fire(
        'Error',
        'Failed to delete the review. Please try again.',
        'error'
      );
    }
  };

  const handleAddNewReview = () => {
    showModal({
      title: 'Add New Review',
      content: (
        <CommentsForm
          onReviewSaved={() => {
            fetchReviews();
          }}
        />
      ),
      width: '50%'
    });
  };

  const handleEditReview = (review) => {
    showModal({
      title: 'Edit Review',
      content: (
        <CommentsForm
          reviewId={review.id}
          onReviewSaved={() => {
            fetchReviews();
          }}
        />
      ),
      width: '50%'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading reviews...</div>;

  return (
    <div className="comments-container">
      <div className="list-header">
        <h2>Reviews Management</h2>
        <button onClick={handleAddNewReview} className="btn-primary">Add New Review</button>
      </div>

      <div className="table-container">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Truck</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Username</th>
              <th>Location</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => {
              const primaryImage = review.trucks?.truck_images?.find(img => img.is_primary) || review.trucks?.truck_images?.[0];

              return (
                <tr key={review.id}>
                  <td className="image-cell">
                    {primaryImage ? (
                      <img src={primaryImage.image_url} alt={review.trucks?.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>{review.trucks?.title || 'Unknown Truck'}</td>
                  <td>{renderStars(review.rating)}</td>
                  <td className="comment-cell">{review.comment}</td>
                  <td>{review.Username}</td>
                  <td>{review.Location}</td>
                  <td>{new Date(review.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <div className="no-data">No reviews found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
};

export default Comments;
