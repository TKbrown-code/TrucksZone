import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import Swal from "sweetalert2";

const TruckForm = ({ truckId, onSave, onTruckSaved, isEdit, selectedCategory }) => {
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    engine_size: '',
    engine_type: '',
    horsepower: '',
    torque: '',
    transmission: '',
    mileage: '',
    previous_owners: '',
    towing_capacity: '',
    exterior_condition: '',
    interior_condition: '',
    tire_condition: '',
    price: '',
    discount_percent: '',
    availability: 'available',
    type: 'Truck'
  });
  const [loading, setLoading] = useState(!!truckId);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(selectedCategory?.id || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch truck data if in edit mode
  useEffect(() => {
    if (truckId) {
      const fetchTruck = async () => {
        try {
          const { data, error } = await supabase
            .from('trucks')
            .select('*')
            .eq('id', truckId)
            .single();

          if (error) throw error;
          if (data) {
            // Convert numeric fields to strings for controlled inputs
            const formattedData = Object.entries(data).reduce((acc, [key, value]) => {
              if (value === null) return acc;
              return {
                ...acc,
                [key]: typeof value === 'number' ? value.toString() : value
              };
            }, {});
            setFormData(formattedData);
            
            // Fetch truck's current category
            fetchTruckCategory(truckId);
          }
        } catch (err) {
          console.error('Error fetching truck:', err);
          setError('Failed to load truck data');
        } finally {
          setLoading(false);
        }
      };

      fetchTruck();
    }
  }, [truckId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTruckCategory = async (truckId) => {
    try {
      const { data, error } = await supabase
        .from('truck_categories')
        .select('category_id')
        .eq('truck_id', truckId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching truck category:', error);
        return;
      }

      if (data) {
        setSelectedCategoryId(data.category_id);
      }
    } catch (error) {
      console.error('Error fetching truck category:', error);
    }
  };

  const createCategory = async (categoryName) => {
    try {
      setCategoryLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName.trim() }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh categories list
      await fetchCategories();
      
      // Set the newly created category as selected
      setSelectedCategoryId(data.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Category Created',
        text: `Category "${categoryName}" has been created successfully!`,
        timer: 1500,
        showConfirmButton: false
      });
      
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create category. Please try again.'
      });
      throw error;
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'new') {
      setShowNewCategoryInput(true);
      setSelectedCategoryId('');
    } else {
      setSelectedCategoryId(value);
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };

  const handleNewCategorySubmit = async (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      await createCategory(newCategoryName.trim());
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and empty string
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDecimalInput = (e) => {
    const { name, value } = e.target;
    // Allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
         // Convert string numbers back to numbers and exclude final_price
    const { final_price, ...formDataWithoutFinalPrice } = formData;
    
    const submissionData = {
      ...formDataWithoutFinalPrice,
      year: formData.year ? parseInt(formData.year, 10) : null,
      horsepower: formData.horsepower ? parseInt(formData.horsepower, 10) : null,
      torque: formData.torque ? parseInt(formData.torque, 10) : null,
      mileage: formData.mileage ? parseInt(formData.mileage, 10) : null,
      previous_owners: formData.previous_owners ? parseInt(formData.previous_owners, 10) : null,
      towing_capacity: formData.towing_capacity ? parseInt(formData.towing_capacity, 10) : null,
      price: formData.price ? parseFloat(formData.price) : 0,
      discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null
    };

      let result;
      if (truckId) {
        // Update existing truck
        const { data, error } = await supabase
          .from('trucks')
          .update(submissionData)
          .eq('id', truckId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new truck
        const { data, error } = await supabase
          .from('trucks')
          .insert([{ ...submissionData, id: uuidv4() }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;

        // Create truck-category association if category is selected
        if (selectedCategoryId) {
          const { error: categoryError } = await supabase
            .from('truck_categories')
            .insert([{
              truck_id: result.id,
              category_id: selectedCategoryId
            }]);
          
          if (categoryError) {
            console.error('Error associating truck with category:', categoryError);
            // Don't throw error here - truck was created successfully
            Swal.fire({
              icon: 'warning',
              title: 'Truck Created',
              text: 'Truck was created but there was an issue associating it with the category.',
              timer: 3000
            });
          }
        }
      }

       if (onSave) {
        onSave(result);
      }

      // Notify parent that truck is saved
      if (onTruckSaved) {
        onTruckSaved(result);
      }

    } catch (err) {
      console.error('Error saving truck:', err);
      setError('Failed to save truck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && truckId) {
    return <div className="loading">Loading truck data...</div>;
  }

  return (
    <div className="truck-form-container">
      <form onSubmit={handleSubmit} className="truck-form">
        <h2>{truckId ? 'Edit Truck' : 'Add New Truck'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                name="year"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleNumberInput}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Truck">Truck</option>
                <option value="Normal Vehicle">Normal Vehicle</option>
              </select>
            </div>
            <div className="form-group">
              <label>Availability</label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">In Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Category</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="category-select"
              >
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="new">+ Create New Category</option>
              </select>
            </div>
          </div>
          
          {showNewCategoryInput && (
            <div className="form-row">
              <div className="form-group">
                <label>New Category Name</label>
                <form onSubmit={handleNewCategorySubmit} className="new-category-form">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="new-category-input"
                    maxLength="50"
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn-create-category"
                    disabled={categoryLoading || !newCategoryName.trim()}
                  >
                    {categoryLoading ? 'Creating...' : 'Create Category'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="btn-cancel-category"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Engine & Performance</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Engine Size</label>
              <input
                type="text"
                name="engine_size"
                value={formData.engine_size}
                onChange={handleChange}
                placeholder="e.g., 6.7L"
              />
            </div>
            <div className="form-group">
              <label>Engine Type</label>
              <input
                type="text"
                name="engine_type"
                value={formData.engine_type}
                onChange={handleChange}
                placeholder="e.g., V8 Turbo Diesel"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Horsepower (HP)</label>
              <input
                type="text"
                name="horsepower"
                value={formData.horsepower}
                onChange={handleNumberInput}
                placeholder="e.g., 400"
              />
            </div>
            <div className="form-group">
              <label>Torque (lb-ft)</label>
              <input
                type="text"
                name="torque"
                value={formData.torque}
                onChange={handleNumberInput}
                placeholder="e.g., 1000"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Transmission</label>
              <input
                type="text"
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                placeholder="e.g., 10-speed Automatic"
              />
            </div>
            <div className="form-group">
              <label>Mileage (miles)</label>
              <input
                type="text"
                name="mileage"
                value={formData.mileage}
                onChange={handleNumberInput}
                placeholder="e.g., 45000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Previous Owners</label>
              <input
                type="text"
                name="previous_owners"
                value={formData.previous_owners}
                onChange={handleNumberInput}
                placeholder="e.g., 2"
              />
            </div>
            <div className="form-group">
              <label>Towing Capacity (lbs)</label>
              <input
                type="text"
                name="towing_capacity"
                value={formData.towing_capacity}
                onChange={handleNumberInput}
                placeholder="e.g., 35000"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Condition</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Exterior Condition</label>
              <select
                name="exterior_condition"
                value={formData.exterior_condition}
                onChange={handleChange}
              >
                <option value="">Select Condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interior Condition</label>
              <select
                name="interior_condition"
                value={formData.interior_condition}
                onChange={handleChange}
              >
                <option value="">Select Condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tire Condition</label>
              <select
                name="tire_condition"
                value={formData.tire_condition}
                onChange={handleChange}
              >
                <option value="">Select Condition</option>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Pricing</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleDecimalInput}
                required
                placeholder="e.g., 45000.00"
              />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="text"
                name="discount_percent"
                value={formData.discount_percent}
                onChange={handleDecimalInput}
                placeholder="e.g., 5.5"
              />
            </div>
          </div>
          {formData.discount_percent && (
            <div className="price-summary">
              <p>Original Price: ${parseFloat(formData.price || 0).toLocaleString()}</p>
              <p>Discount: {formData.discount_percent}%</p>
              <p className="final-price">
                Final Price: $
                {(
                  (parseFloat(formData.price || 0) * 
                  (1 - parseFloat(formData.discount_percent || 0) / 100))
                ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Truck'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TruckForm;