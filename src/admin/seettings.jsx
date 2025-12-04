import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import './settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfileData({
          email: user.email || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        setProfileData({
          email: user.email || '',
          full_name: '',
          phone: '',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile data (email is disabled, so no email update)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      await Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully!',
        confirmButtonColor: '#007bff'
      });

      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'Failed to update profile. Please try again.',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirmation do not match.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      await Swal.fire({
        icon: 'error',
        title: 'Password Too Short',
        text: 'Password must be at least 6 characters long.',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    setLoading(true);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (passwordError) throw passwordError;

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      await Swal.fire({
        icon: 'success',
        title: 'Password Updated',
        text: 'Your password has been changed successfully!',
        confirmButtonColor: '#28a745'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Password Update Failed',
        text: error.message || 'Failed to update password. Please try again.',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3>Profile Information</h3>
            <form onSubmit={updateProfile} className="settings-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                  disabled
                  title="Email cannot be changed from settings. Contact support if needed."
                />
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="settings-section">
            <h3>Change Password</h3>
            <form onSubmit={updatePassword} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your new password"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm your new password"
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button> 
            </form>
            
          </div>
          
        )}
      </div>
      
    </div>
  );
};

export default Settings;
