import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faUserShield, 
  faUser, 
  faSearch,
  faFilter,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './manageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  location: '',
  is_admin: false
});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setUsers(data || []);
  } catch (err) {
    setError(err.message || 'Failed to load users');
  } finally {
    setLoading(false);
  }
};

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = 
        roleFilter === 'all' || 
        (roleFilter === 'admin' && user.is_admin) || 
        (roleFilter === 'user' && !user.is_admin);
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: !currentStatus, 
          updated_at: new Date() 
        })
        .eq('user_id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditClick = (user) => {
  setEditingUser(user);
  setFormData({
    name: user.name || '',
    email: user.email || '',
    location: user.location || '',
    is_admin: user.is_admin || false
  });
  setShowEditModal(true);
};

const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

const handleUpdateUser = async (e) => {
  e.preventDefault();
  if (!editingUser) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        location: formData.location,
        is_admin: formData.is_admin,
        updated_at: new Date()
      })
      .eq('user_id', editingUser.user_id);

    if (error) throw error;
    
    toast.success('User updated successfully');
    fetchUsers(); // Refresh the user list
    setShowEditModal(false);
  } catch (err) {
    toast.error(err.message || 'Failed to update user');
  }
};

  const shortenId = (id) => {
    return id ? `${id.substring(0, 8)}...` : 'N/A';
  };

  if (loading) {
    return <div className="loading-container">Loading users...</div>;
  }

  return (
    <div className="manage-users">
      <div className="manage-users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage your application users and their permissions</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <FontAwesomeIcon icon={faFilter} className="filter-icon" />
          <select 
            value={roleFilter} 
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="user">Regular Users</option>
          </select>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card primary">
            <span className="stat-value">
              {users.filter(u => u.is_admin).length}
            </span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Member Since</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.user_id} className="user-row">
                  <td className="user-id" title={user.user_id}>
                    {shortenId(user.user_id)}
                  </td>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.location || 'N/A'}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <button
                      onClick={() => toggleAdminStatus(user.user_id, user.is_admin)}
                      className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}
                      title={user.is_admin ? 'Click to remove admin' : 'Click to make admin'}
                    >
                      <FontAwesomeIcon icon={user.is_admin ? faUserShield : faUser} />
                      {user.is_admin ? ' Admin' : ' User'}
                    </button>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(user)}
                      title="Edit User"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => deleteUser(user.user_id)}
                      title="Delete User"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="no-results">
                <td colSpan="7">No users found matching your criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-arrow"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-arrow"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
      {/* Edit User Modal */}
{showEditModal && (
  <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Edit User</h3>
        <button 
          className="close-button" 
          onClick={() => setShowEditModal(false)}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <form onSubmit={handleUpdateUser} className="modal-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled
          />
        </div>
        
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Admin User
          </label>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>
          <button type="submit" className="btn-save">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default ManageUsers;