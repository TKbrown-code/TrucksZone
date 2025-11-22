// Test script to verify browser notifications are working
// Copy and paste this into your browser console to test

export function runNotificationTest() {
  console.log('=== Windows Notification Test ===');
  
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.error('❌ This browser does not support notifications');
    return;
  }
  
  console.log('✅ Notifications are supported');
  console.log('Current permission:', Notification.permission);
  
  // Request permission
  if (Notification.permission === 'default') {
    console.log('📋 Requesting permission...');
    Notification.requestPermission().then(permission => {
      console.log('Permission result:', permission);
      if (permission === 'granted') {
        sendTestNotification();
      } else {
        console.error('❌ Permission denied. Enable notifications in browser settings.');
      }
    });
  } else if (Notification.permission === 'granted') {
    sendTestNotification();
  } else {
    console.error('❌ Permission denied. Check browser settings.');
  }
}

function sendTestNotification() {
  console.log('🔔 Sending test notification...');
  
  const notification = new Notification('🚚 TrucksZone Test', {
    body: 'This is a test notification. If you see this, notifications are working!',
    icon: '/vite.svg',
    tag: 'test-' + Date.now(),
    requireInteraction: true,
    silent: false
  });
  
  notification.onclick = () => {
    console.log('✅ Notification clicked!');
    window.focus();
    notification.close();
  };
  
  setTimeout(() => {
    notification.close();
    console.log('🔔 Test notification closed');
  }, 5000);
}

// Windows-specific checks
export function checkWindowsSettings() {
  console.log('=== Windows Settings Check ===');
  console.log('1. Check Windows Settings > System > Notifications & actions');
  console.log('2. Make sure "Get notifications from apps and other senders" is ON');
  console.log('3. Make sure your browser is allowed to send notifications');
  console.log('4. Check Focus Assist settings - they might be blocking notifications');
  console.log('5. Check Do Not Disturb mode');
}

// Browser-specific checks
export function checkBrowserSettings() {
  console.log('=== Browser Settings Check ===');
  console.log('Chrome: Settings > Privacy and security > Site Settings > Notifications');
  console.log('Firefox: Options > Privacy & Security > Permissions > Notifications');
  console.log('Edge: Settings > Cookies and site permissions > Notifications');
  console.log('Make sure TrucksZone is allowed to send notifications');
}

// Run this in console: runNotificationTest()
export { runNotificationTest as default };
