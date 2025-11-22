// Notification utility for Windows and desktop notifications
class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.init();
  }

  async init() {
    if (this.isSupported) {
      this.permission = await Notification.requestPermission();
      console.log('Notification permission:', this.permission);
    }
  }

  // Show notification for incoming messages
  showMessageNotification(senderName, message, isAdmin = false) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.log('Notifications not supported or permission denied');
      return;
    }

    const title = isAdmin ? `New message from ${senderName}` : 'New admin reply';
    const body = this.truncateMessage(message, 100);
    
    const notification = new Notification(title, {
      body: body,
      icon: '/vite.svg', // Use existing vite.svg instead of missing favicon
      badge: '/vite.svg',
      tag: `chat-${Date.now()}`, // Unique tag to prevent duplicates
      requireInteraction: true, // Keep notification until user interacts
      silent: false, // Play sound
    });

    // Auto-close after 8 seconds
    setTimeout(() => {
      notification.close();
    }, 8000);

    // Click handler to focus window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Show notification for new user signup (admin only)
  showSignupNotification(userName, userEmail) {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    const notification = new Notification('New User Signup', {
      body: `${userName} (${userEmail}) just joined!`,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: `signup-${Date.now()}`,
      requireInteraction: false,
    });

    setTimeout(() => {
      notification.close();
    }, 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Helper to truncate long messages
  truncateMessage(message, maxLength) {
    if (!message) return 'New message';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }

  // Check if notifications are available
  isAvailable() {
    return this.isSupported && this.permission === 'granted';
  }

  // Request permission (call this on user interaction)
  async requestPermission() {
    if (!this.isSupported) return false;
    
    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export convenience functions
export const showNewMessageNotification = (senderName, message, isAdmin = false) => {
  notificationManager.showMessageNotification(senderName, message, isAdmin);
};

export const showSignupNotification = (userName, userEmail) => {
  notificationManager.showSignupNotification(userName, userEmail);
};

export const requestNotificationPermission = async () => {
  return await notificationManager.requestPermission();
};

export const areNotificationsAvailable = () => {
  return notificationManager.isAvailable();
};
