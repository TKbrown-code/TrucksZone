import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useModal } from '../contexts/ModalContext';
import TruckForm from './TruckForm';
import TruckDetails from './TruckDetails';
import TruckMediaUploader from './TruckMediaUploader';
import Swal from "sweetalert2";
import "./TrucksList.css";

const TrucksList = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterId, setFilterId] = useState('');
  const [categories, setCategories] = useState([]);
  const trucksPerPage = 10;
  const { showModal } = useModal();

  useEffect(() => {
    fetchTrucks();
    fetchCategories();
  }, [currentPage, searchTerm, filterType, filterId]);

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

  const createCategory = async (categoryName) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName.trim() }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh categories list
      await fetchCategories();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('trucks')
        .select(`
          *,
          truck_images (*),
          truck_videos (*)
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
      }

      // Apply type filter
      if (filterType) {
        query = query.eq('type', filterType);
      }

      // Apply ID filter
      if (filterId) {
        query = query.eq('id', filterId);
      }

      // Apply pagination
      const from = (currentPage - 1) * trucksPerPage;
      const to = from + trucksPerPage - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setTrucks(data || []);
      setTotalPages(Math.ceil((count || 0) / trucksPerPage));
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleIdFilter = useCallback((e) => {
    setFilterId(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

const deleteTruck = async (id) => {
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

    // Only proceed if user confirms
    if (result.isConfirmed) {
      // First, fetch the truck with its media
      const { data: truck, error: fetchError } = await supabase
        .from('trucks')
        .select('truck_images(image_url), truck_videos(video_url)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete images from storage
      if (truck.truck_images && truck.truck_images.length > 0) {
        const imagePaths = truck.truck_images.map(img => img.image_url);
        await supabase.storage.from('truck_images').remove(imagePaths);
      }

      // Delete videos from storage
      if (truck.truck_videos && truck.truck_videos.length > 0) {
        const videoPaths = truck.truck_videos.map(vid => vid.video_url);
        await supabase.storage.from('truck_videos').remove(videoPaths);
      }

      // Delete the truck from database
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Show success message after successful deletion
      await Swal.fire(
        'Deleted!',
        'The truck and associated media have been deleted successfully.',
        'success'
      );

      // Refresh the list
      fetchTrucks();
    }
  } catch (error) {
    console.error('Error deleting truck:', error);
    await Swal.fire(
      'Error',
      'Failed to delete the truck. Please try again.',
      'error'
    );
  }
};

  const handleAddNewTruck = async () => {
    try {
      // Show category selection modal
      const { value: categoryOption } = await Swal.fire({
        title: 'Select or Create Category',
        html: `
          <div class="category-modal">
            <div class="existing-categories">
              <h3>Select Existing Category:</h3>
              <div class="category-list" id="categoryList">
                ${categories.map(cat => `
                  <div class="category-item" data-category-id="${cat.id}" data-category-name="${cat.name}">
                    <span class="category-name">${cat.name}</span>
                  </div>
                `).join('')}
                ${categories.length === 0 ? '<p class="no-categories">No categories available</p>' : ''}
              </div>
            </div>
            <div class="new-category">
              <h3>Or Create New Category:</h3>
              <input 
                type="text" 
                id="newCategoryInput" 
                class="swal2-input" 
                placeholder="Enter new category name"
                maxlength="50"
              >
            </div>
          </div>
        `,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        preConfirm: () => {
          const selectedCategory = document.querySelector('.category-item.selected');
          const newCategoryInput = document.getElementById('newCategoryInput');
          const newCategoryName = newCategoryInput.value.trim();

          if (!selectedCategory && !newCategoryName) {
            Swal.showValidationMessage('Please select an existing category or enter a new category name');
            return false;
          }

          if (selectedCategory && newCategoryName) {
            Swal.showValidationMessage('Please either select an existing category OR create a new one, not both');
            return false;
          }

          if (selectedCategory) {
            return {
              type: 'existing',
              categoryId: selectedCategory.dataset.categoryId,
              categoryName: selectedCategory.dataset.categoryName
            };
          } else if (newCategoryName) {
            return {
              type: 'new',
              categoryName: newCategoryName
            };
          }
        },
        didOpen: () => {
          // Add click handlers for category selection
          const categoryItems = document.querySelectorAll('.category-item');
          categoryItems.forEach(item => {
            item.addEventListener('click', function() {
              // Remove previous selection
              categoryItems.forEach(cat => cat.classList.remove('selected'));
              // Add selection to clicked item
              this.classList.add('selected');
              // Clear new category input when selecting existing
              document.getElementById('newCategoryInput').value = '';
            });
          });

          // Add input handler to clear selection when typing new category
          const newCategoryInput = document.getElementById('newCategoryInput');
          newCategoryInput.addEventListener('input', function() {
            if (this.value.trim()) {
              // Clear existing selection
              categoryItems.forEach(cat => cat.classList.remove('selected'));
            }
          });
        }
      });

      if (categoryOption) {
        let selectedCategory;

        if (categoryOption.type === 'new') {
          // Create new category
          try {
            selectedCategory = await createCategory(categoryOption.categoryName);
            await Swal.fire({
              icon: 'success',
              title: 'Category Created',
              text: `Category "${categoryOption.categoryName}" has been created successfully!`,
              timer: 1500,
              showConfirmButton: false
            });
          } catch (error) {
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to create category. Please try again.'
            });
            return;
          }
        } else {
          // Use existing category
          selectedCategory = {
            id: categoryOption.categoryId,
            name: categoryOption.categoryName
          };
        }

        // Now show the truck form with the selected category
        showModal({
          title: 'Add New Truck',
          content: (
            <div>
              <TruckForm 
                selectedCategory={selectedCategory}
                onTruckSaved={(truck) => {
                  fetchTrucks();
                  showModal({
                    title: 'Upload Media for New Truck',
                    content: <TruckMediaUploader truckId={truck.id} />,
                    width: '85%'
                  });
                }} 
              />
            </div>
          ),
          width: '85%'
        });
      }
    } catch (error) {
      console.error('Error in category selection:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while selecting category. Please try again.'
      });
    }
  };

  const handleViewDetails = (truck) => {
    showModal({
      title: `${truck.title} - Details`,
      content: <TruckDetails truck={truck} />,
      width: '85%'
    });
  };

  const handleEditTruck = (truck) => {
    showModal({
      title: 'Edit Truck',
      content: (
        <div>
          <TruckForm
            truckId={truck.id}
            onTruckSaved={(updatedTruck) => {
              fetchTrucks();
              showModal({
                title: 'Upload Media for Updated Truck',
                content: <TruckMediaUploader truckId={updatedTruck.id} />,
                width: '85%'
              });
            }}
          />
        </div>
      ),
      width: '85%'
    });
  };

  if (loading) return <div className="loading">Loading trucks...</div>;

  return (
    <div className="trucks-list-container">
      <div className="list-header">
        <h2>Trucks Management</h2>
        <button onClick={handleAddNewTruck} className="btn-primary">Add New Truck</button>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search by title, brand, or model..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Filter by ID..."
            value={filterId}
            onChange={handleIdFilter}
            className="id-filter-input"
          />
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Pickup">Pickup</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Convertible">Convertible</option>
            <option value="Wagon">Wagon</option>
            <option value="Coupe">Coupe</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-container">
        <table className="trucks-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Year</th>
              <th>Price</th>
              <th>Type</th>
              <th>Media</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map(truck => {
              const primaryImage = truck.truck_images?.find(img => img.is_primary) || truck.truck_images?.[0];

              return (
                <tr key={truck.id}>
                  <td className="image-cell">
                    {primaryImage ? (
                      <img src={primaryImage.image_url} alt={truck.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>{truck.title}</td>
                  <td>{truck.brand}</td>
                  <td>{truck.model}</td>
                  <td>{truck.year}</td>
                  <td>${truck.price?.toLocaleString()}</td>
                  <td>{truck.type}</td>
                  <td>
                    <div className="media-count">
                      {truck.truck_images?.length > 0 && (
                        <span className="media-badge">{truck.truck_images.length} img</span>
                      )}
                      {truck.truck_videos?.length > 0 && (
                        <span className="media-badge">{truck.truck_videos.length} vid</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleViewDetails(truck)}
                        className="btn-view"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditTruck(truck)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTruck(truck.id)}
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
        {trucks.length === 0 && (
          <div className="no-data">No trucks found</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="trucks-grid">
        {trucks.map(truck => {
          const primaryImage = truck.truck_images?.find(img => img.is_primary) || truck.truck_images?.[0];
          const additionalImages = truck.truck_images?.filter(img => !img.is_primary) || [];
          const videos = truck.truck_videos || [];

          return (
            <div key={truck.id} className="truck-card">
              <div className="truck-image">
                {primaryImage ? (
                  <img src={primaryImage.image_url} alt={truck.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="truck-details">
                <h3>{truck.title}</h3>
                <div className="truck-info">
                  <p><strong>Brand:</strong> {truck.brand}</p>
                  <p><strong>Model:</strong> {truck.model}</p>
                  <p><strong>Year:</strong> {truck.year}</p>
                  <p><strong>Price:</strong> ${truck.price?.toLocaleString()}</p>
                  <p><strong>Type:</strong> {truck.type}</p>
                </div>
                <div className="media-count">
                  {truck.truck_images?.length > 0 && (
                    <span>{truck.truck_images.length} image{truck.truck_images.length > 1 ? 's' : ''}</span>
                  )}
                  {truck.truck_videos?.length > 0 && (
                    <span>{truck.truck_videos.length} video{truck.truck_videos.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="actions">
                  <button
                    onClick={() => handleViewDetails(truck)}
                    className="btn-view"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditTruck(truck)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTruck(truck.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {trucks.length === 0 && (
          <div className="no-data">No trucks found</div>
        )}
      </div>

      {/* Pagination */}
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

export default TrucksList;
