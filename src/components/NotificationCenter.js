import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { notificationAPI } from '../services/api';
import { 
  BellIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

/** Resolve link path from API notification (relatedEntity set by backend). */
const getNotificationTargetPath = (notification) => {
  const rel = notification?.relatedEntity;
  if (!rel?.type || rel.entityId == null) return null;

  const rawId = rel.entityId;
  const id =
    typeof rawId === 'string'
      ? rawId
      : typeof rawId?.toString === 'function'
        ? rawId.toString()
        : null;
  if (!id || id === 'undefined' || id === 'null') return null;

  switch (rel.type) {
    case 'inquiry':
      return `/inquiry/${id}`;
    case 'quotation':
      return `/quotation/${id}`;
    case 'order':
      return `/order/${id}`;
    default:
      return null;
  }
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications - optimized to prevent multiple calls
  const { data: notificationData, refetch } = useQuery(
    'notifications',
    async () => {
      try {
        const response = await notificationAPI.getNotifications();
        return response.data.notifications || [];
      } catch (error) {
        // Don't log cancellation errors
        if (error.name !== 'CanceledError' && process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch notifications:', error);
        }
        return [];
      }
    },
    {
      refetchInterval: 60000, // Refetch every 60 seconds (reduced frequency)
      refetchOnWindowFocus: false, // Disable refetch on window focus to prevent multiple calls
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Keep in cache for 5 minutes
    }
  );

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData);
    }
  }, [notificationData]);

  // Auto-close notification panel after 7 seconds when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 7000); // 7 seconds (middle of 5-10 seconds range)

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-4 border-l-red-500 bg-red-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }, []);

  const handleNotificationClick = async (notification) => {
    const path = getNotificationTargetPath(notification);
    await markAsRead(notification._id);
    if (path) {
      setIsOpen(false);
      navigate(path);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const targetPath = getNotificationTargetPath(notification);
                  return (
                    <button
                      type="button"
                      key={notification._id}
                      className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
                        !notification.read ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      title={targetPath ? 'Open details' : undefined}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  // Mark all as read
                  try {
                    await notificationAPI.markAllAsRead();
                    setNotifications(prev => 
                      prev.map(n => ({ ...n, read: true }))
                    );
                  } catch (error) {
                    console.error('Failed to mark all notifications as read:', error);
                  }
                }}
                className="w-full text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
