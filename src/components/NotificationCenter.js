import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { notificationAPI } from '../services/api';
import {
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

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
    case 'payment':
      return '/orders';
    default:
      return null;
  }
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [panelStyle, setPanelStyle] = useState({});
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  const { data: notificationData, refetch, isLoading } = useQuery(
    'notifications',
    async () => {
      try {
        const response = await notificationAPI.getNotifications();
        return response.data.notifications || [];
      } catch (error) {
        if (error.name !== 'CanceledError' && process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch notifications:', error);
        }
        return [];
      }
    },
    {
      refetchInterval: 60000,
      refetchOnWindowFocus: true,
      staleTime: 5000,
      refetchOnMount: 'always',
      cacheTime: 300000,
    }
  );

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData);
    }
  }, [notificationData]);

  const updatePanelPosition = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    const panelWidth = 320;
    const gap = 8;
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    if (left + panelWidth > window.innerWidth - 8) {
      left = window.innerWidth - panelWidth - 8;
    }
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + gap,
      left,
      width: panelWidth,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    updatePanelPosition();
    refetch();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [isOpen, updatePanelPosition, refetch]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (e) => {
      if (
        panelRef.current?.contains(e.target) ||
        bellRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 shrink-0 text-blue-500" />;
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatUnreadBadge = (count) => {
    if (count > 99) return '99+';
    if (count > 10) return '10+';
    if (count > 9) return '9+';
    return count;
  };

  const panel = isOpen
    ? createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998] bg-transparent"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={panelRef}
            style={panelStyle}
            className="flex max-h-[min(24rem,calc(100vh-6rem))] flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="shrink-0 border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close notifications"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">No notifications</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const targetPath = getNotificationTargetPath(notification);
                    return (
                      <button
                        type="button"
                        key={notification._id}
                        className={`w-full text-left p-4 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
                          !notification.read ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'bg-white'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                        title={targetPath ? 'Open details' : undefined}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                            <p className="mt-2 text-xs text-gray-400">
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
              <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await notificationAPI.markAllAsRead();
                      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    } catch (error) {
                      console.error('Failed to mark all notifications as read:', error);
                    }
                  }}
                  className="w-full rounded-md py-2 text-sm font-medium text-green-600 hover:bg-green-50 hover:text-green-800"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={bellRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {formatUnreadBadge(unreadCount)}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
};

export default NotificationCenter;
