import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faSave, 
  faCamera, 
  faSpinner,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import "../../styles/userProfile.css";

function UserProfile() {
    const { profile, user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        profileImage: null
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        if (!user) {
            navigate("/");
        } else if (profile) {
            setFormData({
                name: profile.name || '',
                email: user.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                profileImage: null
            });
            
            if (profile.photoURL) {
                setPreviewUrl(profile.photoURL);
            } else {
                setPreviewUrl('https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name || 'User') + '&background=random');
            }
        }
    }, [user, profile, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profileImage' && files && files[0]) {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            await updateProfile(formData);
            setIsEditing(false);
            showNotification('success', 'Profile updated successfully!');
        } catch (error) {
            showNotification('error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    <FontAwesomeIcon 
                        icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} 
                        className="notification-icon" 
                    />
                    {notification.message}
                </div>
            )}
            
            <div className="profile-card">
                <div className="profile-header">
                    <h2>
                        <FontAwesomeIcon icon={faUser} className='icon'/> 
                        <span>My Profile</span>
                    </h2>
                    <button 
                        onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                        className={`edit-btn ${isEditing ? 'cancel' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                            </>
                        ) : isEditing ? (
                            'Cancel'
                        ) : (
                            'Edit Profile'
                        )}
                    </button>
                </div>

                <div className="profile-content">
                    <div className="profile-image-section">
                        <div className="profile-image-container">
                            <img 
                                src={previewUrl} 
                                alt="Profile" 
                                className="profile-image"
                            />
                            {isEditing && (
                                <div className="image-overlay" onClick={triggerFileInput}>
                                    <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                                    <span>Change Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                name="profileImage"
                                onChange={handleChange}
                                accept="image/*"
                                className="file-input"
                            />
                        </div>
                        {isEditing && (
                            <p className="image-hint">Click on the image to change your profile picture</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label><FontAwesomeIcon icon={faUser} className="input-icon" /> Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label><FontAwesomeIcon icon={faEnvelope} className="input-icon" /> Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label><FontAwesomeIcon icon={faPhone} className="input-icon" /> Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label><FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" /> Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                    placeholder="Enter your location"
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="save-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faSave} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;