import { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { showNewMessageNotification, showSignupNotification, requestNotificationPermission } from '../utils/notifications';
import { useAuth } from './AuthContext';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const channelsRef = useRef({});
  const timeoutRef = useRef(null);
  const activeToastRef = useRef(null);

  // Generate encryption key for messages
  const getEncryptionKey = (senderId, receiverId) => {
    const sortedIds = [senderId, receiverId].sort();
    return CryptoJS.SHA256(sortedIds.join('-')).toString();
  };

  // Decrypt message
  const decryptMessage = (encryptedMessage, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      // Decryption failed
      return '[Encrypted message]';
    }
  };

  // SweetAlert2 notification for new messages
  const showSweetAlertMessage = (senderName, message, isAdmin = false) => {
    // Close any existing toast to prevent stacking
    if (activeToastRef.current) {
      activeToastRef.current.close();
    }

    const toast = Swal.mixin({
      toast: true,
      position: isAdmin ? 'top-end' : 'top-start',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
      didDestroy: () => {
        activeToastRef.current = null;
      }
    });

    const title = isAdmin ? `New message from ${senderName}` : 'New admin reply';
    const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message;

    activeToastRef.current = toast.fire({
      icon: 'info',
      title: title,
      html: `
        <div style="text-align: left;">
          <p style="margin: 0; font-size: 14px; color: #666;">${truncatedMessage}</p>
          ${message.length > 100 ? '<small style="color: #999;">Click to view full message</small>' : ''}
        </div>
      `,
      customClass: {
        popup: 'message-notification-toast',
        title: 'message-notification-title'
      }
    });

    // Store reference for cleanup
    activeToastRef.current.then((result) => {
      if (result.isDismissed) {
        activeToastRef.current = null;
      }
    });
  };

  // SweetAlert2 notification for new signups (admin only)
  const showSweetAlertSignup = (userName, userEmail) => {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    toast.fire({
      icon: 'success',
      title: 'New User Signup',
      html: `
        <div style="text-align: left;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>${userName}</strong><br>
            <small style="color: #999;">${userEmail}</small>
          </p>
        </div>
      `
    });
  };

  // Clean up all channels
  const cleanupChannels = () => {
    Object.values(channelsRef.current).forEach(channel => {
      if (channel && channel.subscription) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          // Silently handle channel removal errors
          // This prevents WebSocket errors during cleanup
        }
      }
    });
    channelsRef.current = {};
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Set up global notification subscriptions
  useEffect(() => {
    if (!user) {
      cleanupChannels();
      return;
    }

    const setupGlobalNotifications = async () => {
      // Request notification permission
      await requestNotificationPermission();

      // Check if user is admin
      const isAdmin = profile?.is_admin || false;

      if (isAdmin) {
        // Admin notifications: new user messages and new signups
        setupAdminNotifications();
      } else {
        // User notifications: admin replies
        setupUserNotifications();
      }
    };

    const setupAdminNotifications = () => {
      // Listen for new user messages
      const messageChannel = supabase
        .channel('admin_global_messages')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          },
          async (payload) => {
            const newMsg = payload.new;
            
            // Only notify for messages from users to admin
            if (!newMsg.is_admin_message && newMsg.receiver_id === user.id) {
              try {
                // Get sender name
                const { data: senderProfile } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('user_id', newMsg.sender_id)
                  .single();
                
                const senderName = senderProfile?.name || 'Unknown User';
                
                // Decrypt message for notification
                const encryptionKey = getEncryptionKey(newMsg.sender_id, newMsg.receiver_id);
                const decryptedMessage = decryptMessage(newMsg.message, encryptionKey);
                
                // Show both desktop notification and SweetAlert2 toast
                showNewMessageNotification(senderName, decryptedMessage, true);
                showSweetAlertMessage(senderName, decryptedMessage, true);
              } catch (error) {
                // Error showing admin message notification
              }
            }
          }
        );

      // Listen for new user signups
      const signupChannel = supabase
        .channel('admin_global_signups')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            const newUser = payload.new;
            if (!newUser.is_admin) {
              // Show both desktop notification and SweetAlert2 toast for new signup
              showSignupNotification(newUser.name || 'Unknown User', newUser.email || 'No email');
              showSweetAlertSignup(newUser.name || 'Unknown User', newUser.email || 'No email');
            }
          }
        );

      // Subscribe to channels
      try {
        messageChannel.subscribe();
        signupChannel.subscribe();
      } catch (error) {
        // Handle subscription errors silently
        // This prevents WebSocket connection errors
      }

      // Store channels for cleanup
      channelsRef.current.messageChannel = messageChannel;
      channelsRef.current.signupChannel = signupChannel;
    };

    const setupUserNotifications = () => {
      // Listen for admin replies
      const messageChannel = supabase
        .channel('user_global_messages')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `receiver_id=eq.${user.id}`
          },
          async (payload) => {
            const newMsg = payload.new;
            
            // Only notify for messages from admin to user
            if (newMsg.is_admin_message) {
              try {
                // Decrypt message for notification
                const encryptionKey = getEncryptionKey(newMsg.sender_id, newMsg.receiver_id);
                const decryptedMessage = decryptMessage(newMsg.message, encryptionKey);
                
                // Show both desktop notification and SweetAlert2 toast for admin reply
                showNewMessageNotification('Admin', decryptedMessage, false);
                showSweetAlertMessage('Admin', decryptedMessage, false);
              } catch (error) {
                // Error showing user message notification
              }
            }
          }
        );

      // Subscribe to channel
      try {
        messageChannel.subscribe();
      } catch (error) {
        // Handle subscription errors silently
        // This prevents WebSocket connection errors
      }

      // Store channel for cleanup
      channelsRef.current.messageChannel = messageChannel;
    };

    setupGlobalNotifications();

    // Cleanup function
    return cleanupChannels;
  }, [user, profile?.is_admin]);

  // Clean up on unmount
  useEffect(() => {
    return cleanupChannels;
  }, []);

  const value = {
    // Can add more notification-related functions here if needed
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
