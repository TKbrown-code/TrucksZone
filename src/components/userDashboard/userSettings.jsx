import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faSpinner, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import './userSettings.css';

function UserSettings() {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validatePassword = (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
        return re.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate form
        if (!currentPassword || !newPassword || !confirmPassword) {
            return setError('All fields are required');
        }

        if (newPassword !== confirmPassword) {
            return setError('New passwords do not match');
        }

        if (!validatePassword(newPassword)) {
            return setError(
                'Password must be at least 8 characters long and include: ' +
                '1 uppercase, 1 lowercase, 1 number, and 1 special character'
            );
        }

        try {
            setLoading(true);
            
            // Update password using Supabase
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error updating password:', err);
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-settings-container">
            <div className="settings-card">
                <h2 className="settings-title">
                    <FontAwesomeIcon icon={faKey} className="title-icon" />
                    Change Password
                </h2>
                
                {error && (
                    <div className="alert alert-error">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {error}
                    </div>
                )}
                
                {success && (
                    <div className="alert alert-success">
                        <FontAwesomeIcon icon={faCheckCircle} /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="password-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="form-input"
                            placeholder="Enter your current password"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input"
                            placeholder="Enter new password"
                            disabled={loading}
                        />
                        <small className="password-hint">
                            Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Confirm new password"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin /> Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserSettings;
