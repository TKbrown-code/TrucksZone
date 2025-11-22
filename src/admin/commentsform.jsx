import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Swal from "sweetalert2";

const CommentsForm = ({ reviewId, onSave, onReviewSaved }) => {
  const [formData, setFormData] = useState({
    truck_id: '',
    rating: '',
    comment: '',
    Username: '',
    Location: ''
  });
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(!!reviewId);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrucks();
    if (reviewId) {
      fetchReview();
    }
  }, [reviewId]);

  const fetchTrucks = async () => {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('id, title');
      if (error) throw error;
      setTrucks(data || []);
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  };

  const fetchReview = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();
      if (error) throw error;
      setFormData(data);
    } catch (err) {
      console.error('Error fetching review:', err);
      setError('Failed to load review data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submissionData = {
        ...formData,
        rating: parseInt(formData.rating, 10)
      };
      let result;
      if (reviewId) {
        const { data, error } = await supabase
          .from('reviews')
          .update(submissionData)
          .eq('id', reviewId)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('reviews')
          .insert([submissionData])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      if (onSave) onSave(result);
      if (onReviewSaved) onReviewSaved(result);
      Swal.fire('Success', 'Review saved successfully', 'success');
    } catch (err) {
      console.error('Error saving review:', err);
      setError('Failed to save review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="comments-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Truck *</label>
        <select
          name="truck_id"
          value={formData.truck_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Truck</option>
          {trucks.map(truck => (
            <option key={truck.id} value={truck.id}>{truck.title}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Rating *</label>
        <select
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          required
        >
          <option value="">Select Rating</option>
          {[1, 2, 3, 4, 5].map(r => (
            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Comment *</label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          required
          rows="4"
          placeholder="Enter your review comment"
        />
      </div>

      <div className="form-group">
        <label>Username *</label>
        <input
          type="text"
          name="Username"
          value={formData.Username}
          onChange={handleChange}
          required
          placeholder="Enter username"
        />
      </div>

      <div className="form-group">
        <label>Location *</label>
        <input
          type="text"
          name="Location"
          value={formData.Location}
          onChange={handleChange}
          required
          placeholder="Enter location"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-save"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Review'}
        </button>
      </div>
    </form>
  );
};

export default CommentsForm;
