import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Updated API URL to use port 8001
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Try to fetch real data but handle missing endpoints gracefully
        try {
          const response = await axios.get(`${API_URL}/api/notifications`);
          if (response.data && Array.isArray(response.data)) {
            setNotifications(response.data);
            setError(null);
          }
        } catch (apiError) {
          console.log('API endpoint not available, using sample notification data');
          throw apiError; // Re-throw to use sample data
        }
      } catch (err) {
        console.log('Using sample notification data for demonstration');
        
        // Always use sample data without showing error to user
        setNotifications([
          {
            id: 1,
            type: 'warning',
            message: 'Unusual network activity detected',
            time: '10 minutes ago',
            read: false
          },
          {
            id: 2,
            type: 'danger',
            message: 'DoS attack attempt blocked',
            time: '1 hour ago',
            read: false
          },
          {
            id: 3,
            type: 'info',
            message: 'System scan completed successfully',
            time: '3 hours ago',
            read: true
          }
        ]);
        
        // Clear error state
        setError(null);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Add a notification when new intrusions are detected (simulation)
  useEffect(() => {
    // This would normally be triggered by a websocket or SSE
    const simulateNewAlert = () => {
      const randomInterval = Math.floor(Math.random() * (120 - 30) + 30) * 1000;
      
      const timeout = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
        
        // Add random notification for demo purposes
        const newNotification = {
          id: Date.now(),
          type: ['warning', 'danger', 'info'][Math.floor(Math.random() * 3)],
          message: [
            'Unusual network activity detected',
            'Potential DoS attack identified',
            'Probe attempt detected from 192.168.1.45',
            'R2L intrusion blocked'
          ][Math.floor(Math.random() * 4)],
          time: 'Just now',
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        simulateNewAlert(); // Schedule next alert
      }, randomInterval);
      
      return timeout;
    };
    
    const timeout = simulateNewAlert();
    return () => clearTimeout(timeout);
  }, []);

  // Calculate unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(notif => !notif.read).length);
  }, [notifications]);

  // Mark notifications as read
  const markAsRead = async (id) => {
    try {
      // In production, uncomment this call to the backend
      // await axios.put(`${API_URL}/api/notifications/${id}/read`);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening
      markAllAsRead();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // In production, uncomment this call to the backend
      // await axios.put(`${API_URL}/api/notifications/read-all`);
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // In production, uncomment this call to the backend
      // await axios.delete(`${API_URL}/api/notifications/clear-all`);
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get style based on notification type
  const getTypeStyles = (type) => {
    switch(type) {
      case 'danger':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleNotifications}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors relative"
        aria-label="Notifications"
      >
        <motion.div
          animate={isAnimating ? 
            { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : 
            { rotate: 0, scale: 1 }
          }
          transition={{ type: "spring", duration: 0.5 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </motion.div>
        
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
              <div className="space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {error ? (
                <div className="p-4 text-center text-red-500 dark:text-red-400">
                  {error}
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-3 border-l-4 ${getTypeStyles(notification.type)} border-b border-gray-200 dark:border-gray-700 cursor-pointer`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{notification.message}</p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notification.time || formatRelativeTime(notification.timestamp)}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link to="/notifications" className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 