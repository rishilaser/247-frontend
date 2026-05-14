import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    courier: '',
    trackingNumber: '',
    estimatedDelivery: ''
  });
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const deliveryModalRef = useRef(null);
  const dispatchModalRef = useRef(null);
  const confirmModalRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Keyboard navigation for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showDeliveryModal) setShowDeliveryModal(false);
        if (showDispatchModal) setShowDispatchModal(false);
        if (showConfirmModal) setShowConfirmModal(false);
      }
    };

    if (showDeliveryModal || showDispatchModal || showConfirmModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDeliveryModal, showDispatchModal, showConfirmModal]);

  // Focus trap for modals
  useEffect(() => {
    if (showDeliveryModal && deliveryModalRef.current) {
      const firstInput = deliveryModalRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
    if (showDispatchModal && dispatchModalRef.current) {
      const firstInput = dispatchModalRef.current.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }, [showDeliveryModal, showDispatchModal]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllOrders();
      
      if (response.data.success) {
        const transformedOrders = response.data.orders.map(order => ({
          id: order._id || order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A',
          title: `Order for ${order.parts?.length || 0} parts`,
          status: order.status,
          amount: order.totalAmount,
          createdAt: order.createdAt ? (typeof order.createdAt === 'string' ? order.createdAt : new Date(order.createdAt).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          expectedDelivery: order.dispatch?.estimatedDelivery 
            ? new Date(order.dispatch.estimatedDelivery).toISOString().split('T')[0] 
            : order.production?.estimatedCompletion 
            ? new Date(order.production.estimatedCompletion).toISOString().split('T')[0] 
            : 'TBD',
          customer: order.customer,
          parts: order.parts,
          payment: order.payment,
          dispatch: order.dispatch
        }));
        setOrders(transformedOrders);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders:', error);
      }
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function for efficient ID matching
  const matchesOrderId = useCallback((order, orderId) => {
    const id = String(orderId);
    return order.id === id || order.id === orderId || 
           order._id === id || order._id === orderId;
  }, []);

  // Generic status update handler to reduce code duplication
  const handleStatusUpdate = useCallback(async (orderId, newStatus, notes, successMessage) => {
    if (!orderId) {
      toast.error('Invalid order ID');
      return;
    }

    if (updatingOrders.has(orderId)) {
      return;
    }

    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId));

      // Optimistic update - immediately update the status and show success toast
      // This gives instant feedback to the user
      setOrders(prevOrders => 
        prevOrders.map(o => 
          matchesOrderId(o, orderId) ? { ...o, status: newStatus } : o
        )
      );
      
      // Show success toast immediately for better UX
      toast.success(successMessage);

      // Make API call in background (non-blocking)
      const response = await adminAPI.updateOrderStatus(orderId, newStatus, { notes });

      if (response.data.success) {
        // Get updated status from response
        const updatedStatus = response.data.order?.status || response.data.status || newStatus;
        
        // Only update if status is different (optimization - avoid unnecessary re-render)
        if (updatedStatus !== newStatus) {
          setOrders(prevOrders => 
            prevOrders.map(o => 
              matchesOrderId(o, orderId) ? { ...o, status: updatedStatus } : o
            )
          );
        }
      } else {
        // On failure, revert optimistic update by refetching
        await fetchOrders();
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error updating order status to ${newStatus}:`, error);
      }
      // On error, revert optimistic update by refetching
      await fetchOrders();
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  }, [updatingOrders, fetchOrders, matchesOrderId]);

  // Validation helper - ensures date is from current date onwards (no past dates)
  const validateDeliveryDate = (dateString) => {
    if (!dateString) return { valid: false, message: 'Please select a delivery date' };
    
    // Check if dateString is valid
    const selectedDate = new Date(dateString);
    if (isNaN(selectedDate.getTime())) {
      return { valid: false, message: 'Invalid date format. Please select a valid date.' };
    }
    
    const now = new Date();
    // For datetime-local, compare with current date and time (not just date)
    // This ensures past dates/times are rejected
    if (selectedDate < now) {
      return { valid: false, message: 'Date and time cannot be in the past. Please select current or future date/time.' };
    }
    
    return { valid: true };
  };

  // Helper to get minimum date for datetime-local input (current date and time)
  const getMinDateTime = () => {
    const now = new Date();
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateTrackingNumber = (trackingNumber) => {
    if (!trackingNumber || trackingNumber.trim().length < 5) {
      return { valid: false, message: 'Tracking number must be at least 5 characters' };
    }
    return { valid: true };
  };

  // Handler for setting delivery time
  const handleSetDeliveryTime = (order) => {
    setSelectedOrder(order);
    setDeliveryTime('');
    setShowDeliveryModal(true);
  };

  const handleSubmitDeliveryTime = async () => {
    if (!deliveryTime) {
      toast.error('Please select delivery time');
      return;
    }

    if (!selectedOrder || !selectedOrder.id) {
      toast.error('Invalid order selected');
      setShowDeliveryModal(false);
        return;
      }

    // Final validation before submission - ensure no past dates slip through
    const validation = validateDeliveryDate(deliveryTime);
    if (!validation.valid) {
      toast.error(validation.message);
      setDeliveryTime('');
      return;
    }

    try {
      setSubmitting(true);
      const orderId = selectedOrder.id;
      
      const response = await adminAPI.updateDeliveryDetails(orderId, {
        estimatedDelivery: deliveryTime,
        notes: 'Production started with estimated delivery time'
      });

      if (response.data.success) {
        toast.success('Delivery time set and customer notified');
        setShowDeliveryModal(false);
        setDeliveryTime('');
        await fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to set delivery time');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error('Error setting delivery time:', error);
      }
      toast.error('Failed to set delivery time');
    } finally {
      setSubmitting(false);
    }
  };

  const getOrderId = (order) => order?.id || order?._id;

  // Confirm Order
  const handleConfirmOrder = async (order, event) => {
    event?.preventDefault();
    event?.stopPropagation();
  
    const orderId = getOrderId(order);
    if (!orderId) {
      toast.error('Invalid order ID');
      return;
    }
  
    if (order.status === 'confirmed') {
      toast.info('Order is already confirmed');
      return;
    }
  
    try {
      await handleStatusUpdate(
        orderId,
        'confirmed',
        'Order confirmed and ready for production',
        'Order confirmed successfully'
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to confirm order');
    }
  };
  
  // Start Production
  const handleStartProduction = async (order, event) => {
    event?.preventDefault();
    event?.stopPropagation();
  
    const orderId = getOrderId(order);
    if (!orderId) {
      toast.error('Invalid order ID');
      return;
    }
  
    if (order.status !== 'confirmed') {
      toast.warning('Please confirm the order before starting production');
      return;
    }
  
    if (order.status === 'in_production') {
      toast.info('Production has already started');
      return;
    }
  
    try {
      await handleStatusUpdate(
        orderId,
        'in_production',
        'Production started for this order',
        'Production started successfully'
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to start production');
    }
  };
  
  // Ready for Dispatch
  const handleMarkReadyForDispatch = async (order, event) => {
    event?.preventDefault();
    event?.stopPropagation();
  
    const orderId = getOrderId(order);
    if (!orderId) {
      toast.error('Invalid order ID');
      return;
    }
  
    if (order.status !== 'in_production') {
      toast.warning('Order must be in production before dispatch');
      return;
    }
  
    if (order.status === 'ready_for_dispatch') {
      toast.info('Order is already ready for dispatch');
      return;
    }
  
    try {
      await handleStatusUpdate(
        orderId,
        'ready_for_dispatch',
        'Order completed and ready for dispatch',
        'Order marked as ready for dispatch'
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark order for dispatch');
    }
  };
  
  // Handler for dispatching order
  const handleDispatchOrder = (order) => {
    setSelectedOrder(order);
    setDispatchData({
      courier: '',
      trackingNumber: '',
      estimatedDelivery: ''
    });
    setShowDispatchModal(true);
  };

  const handleSubmitDispatch = async () => {
    if (!dispatchData.courier || !dispatchData.trackingNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedOrder || !selectedOrder.id) {
      toast.error('Invalid order selected');
      setShowDispatchModal(false);
        return;
      }

    const courierValidation = dispatchData.courier.trim().length >= 2;
    if (!courierValidation) {
      toast.error('Courier name must be at least 2 characters');
      return;
    }

    const trackingValidation = validateTrackingNumber(dispatchData.trackingNumber);
    if (!trackingValidation.valid) {
      toast.error(trackingValidation.message);
      return;
    }

    if (dispatchData.estimatedDelivery) {
      const dateValidation = validateDeliveryDate(dispatchData.estimatedDelivery);
      if (!dateValidation.valid) {
        toast.error(dateValidation.message);
        setDispatchData({...dispatchData, estimatedDelivery: ''});
        return;
      }
    }

    try {
      setSubmitting(true);
      const orderId = selectedOrder.id;
      
      const response = await adminAPI.updateDispatchDetails(orderId, dispatchData);

      if (response.data.success) {
        toast.success('Order dispatched and customer notified');
        setShowDispatchModal(false);
        setDispatchData({ courier: '', trackingNumber: '', estimatedDelivery: '' });
        
        // Optimistic update
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, status: 'dispatched' } : o
          )
        );
        
        await fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to dispatch order');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      console.error('Error dispatching order:', error);
      }
      toast.error('Failed to dispatch order');
      await fetchOrders();
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for marking order as delivered
  const handleMarkDelivered = async (order) => {
    const orderId = order.id;
    if (!orderId) {
      toast.error('Invalid order ID');
      return;
    }

    await handleStatusUpdate(
      orderId,
      'delivered',
      'Order delivered successfully',
      'Order marked as delivered'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'in_production':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'ready_for_dispatch':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'dispatched':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getFilterButtonColor = (status) => {
    switch (status) {
      case 'all':
        return {
          active: 'bg-gray-700 text-white',
          inactive: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        };
      case 'pending':
        return {
          active: 'bg-amber-500 text-white',
          inactive: 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
        };
      case 'confirmed':
        return {
          active: 'bg-blue-600 text-white',
          inactive: 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
        };
      case 'in_production':
        return {
          active: 'bg-indigo-600 text-white',
          inactive: 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
        };
      case 'ready_for_dispatch':
        return {
          active: 'bg-orange-500 text-white',
          inactive: 'bg-white text-orange-700 border border-orange-300 hover:bg-orange-50'
        };
      case 'dispatched':
        return {
          active: 'bg-cyan-600 text-white',
          inactive: 'bg-white text-cyan-700 border border-cyan-300 hover:bg-cyan-50'
        };
      case 'delivered':
        return {
          active: 'bg-green-600 text-white',
          inactive: 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
        };
      case 'cancelled':
        return {
          active: 'bg-red-600 text-white',
          inactive: 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
        };
      default:
        return {
          active: 'bg-gray-600 text-white',
          inactive: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        };
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  if (loading) {
    return (
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading orders"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full" style={{ minWidth: 0 }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        {/* Filter Buttons */}
        <div className="mt-6" style={{ minWidth: 0, width: '100%' }}>
          <div className="flex flex-wrap gap-3" style={{ minWidth: 0 }}>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'all'
                  ? getFilterButtonColor('all').active
                  : getFilterButtonColor('all').inactive
              }`}
              aria-label="Show all orders"
            >
              <span>All Orders</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'all' ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {orders.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'pending'
                  ? getFilterButtonColor('pending').active
                  : getFilterButtonColor('pending').inactive
              }`}
              aria-label="Show pending orders"
            >
              <span>Pending</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'pending' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {getStatusCount('pending')}
              </span>
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'confirmed'
                  ? getFilterButtonColor('confirmed').active
                  : getFilterButtonColor('confirmed').inactive
              }`}
              aria-label="Show confirmed orders"
            >
              <span>Confirmed</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'confirmed' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {getStatusCount('confirmed')}
              </span>
            </button>
            <button
              onClick={() => setFilter('in_production')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'in_production'
                  ? getFilterButtonColor('in_production').active
                  : getFilterButtonColor('in_production').inactive
              }`}
              aria-label="Show orders in production"
            >
              <span>In Production</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'in_production' ? 'bg-white/30 text-white' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {getStatusCount('in_production')}
              </span>
            </button>
            <button
              onClick={() => setFilter('ready_for_dispatch')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'ready_for_dispatch'
                  ? getFilterButtonColor('ready_for_dispatch').active
                  : getFilterButtonColor('ready_for_dispatch').inactive
              }`}
              aria-label="Show orders ready for dispatch"
            >
              <span>Ready for Dispatch</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'ready_for_dispatch' ? 'bg-white/30 text-white' : 'bg-orange-100 text-orange-600'
              }`}>
                {getStatusCount('ready_for_dispatch')}
              </span>
            </button>
            <button
              onClick={() => setFilter('dispatched')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'dispatched'
                  ? getFilterButtonColor('dispatched').active
                  : getFilterButtonColor('dispatched').inactive
              }`}
              aria-label="Show dispatched orders"
            >
              <span>Dispatched</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'dispatched' ? 'bg-white/30 text-white' : 'bg-cyan-100 text-cyan-600'
              }`}>
                {getStatusCount('dispatched')}
              </span>
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                filter === 'delivered'
                  ? getFilterButtonColor('delivered').active
                  : getFilterButtonColor('delivered').inactive
              }`}
              aria-label="Show delivered orders"
            >
              <span>Delivered</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === 'delivered' ? 'bg-white/30 text-white' : 'bg-green-100 text-green-600'
              }`}>
                {getStatusCount('delivered')}
              </span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="mt-6" style={{ minWidth: 0, width: '100%' }}>
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg" style={{ minWidth: 0, width: '100%' }}>
            <div className="order-table-horizontal-scroll overflow-x-auto w-full" style={{ 
              WebkitOverflowScrolling: 'touch'
            }}>
              <div className="max-h-[500px] overflow-y-auto" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6'
              }}>
                <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Orders table" style={{ minWidth: '1200px', width: '100%' }}>
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Order Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Expected Delivery
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors" onClick={(e) => {
                        const target = e.target;
                        const isButton = target.tagName === 'BUTTON' || target.closest('button');
                        const isLink = target.tagName === 'A' || target.closest('a');
                        const isInput = target.tagName === 'INPUT' || target.closest('input');
                        
                        if (isButton || isLink || isInput) {
                          return;
                        }
                      }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {order.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(order.status)}`} role="status" aria-label={`Order status: ${order.status}`}>
                            {order.status === 'pending' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'confirmed' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'in_production' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'ready_for_dispatch' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'dispatched' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'delivered' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'cancelled' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{order.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.createdAt ? (typeof order.createdAt === 'string' ? new Date(order.createdAt).toLocaleDateString() : order.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.expectedDelivery === 'TBD' ? (
                            <span className="text-gray-400">TBD</span>
                          ) : order.expectedDelivery ? (
                            (() => {
                              try {
                                const date = new Date(order.expectedDelivery);
                                return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                              } catch {
                                return 'Invalid Date';
                              }
                            })()
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <div className="flex items-center justify-end space-x-2 relative z-10">
                            <Link
                              to={`/order/${order.id}`}
                              className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors relative z-10"
                              onClick={(e) => { e.stopPropagation(); }}
                              aria-label={`View order ${order.orderNumber}`}
                            >
                              View
                            </Link>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmOrder(order, e);
                                  }}
                                  disabled={updatingOrders.has(order.id)}
                                  className={`px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors relative z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    updatingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  aria-label={`Confirm order ${order.orderNumber}`}
                                >
                                  {updatingOrders.has(order.id) ? 'Updating...' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    handleSetDeliveryTime(order); 
                                  }}
                                  className="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors relative z-10 cursor-pointer"
                                  aria-label={`Set delivery time for order ${order.orderNumber}`}
                                >
                                  Set Delivery
                                </button>
                              </>
                            )}
                            {order.status === 'confirmed' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleStartProduction(order, e);
                                  }}
                                  disabled={updatingOrders.has(order.id)}
                                  className={`px-3 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors relative z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                    updatingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  aria-label={`Start production for order ${order.orderNumber}`}
                                >
                                  {updatingOrders.has(order.id) ? 'Updating...' : 'Start Production'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    handleSetDeliveryTime(order); 
                                  }}
                                  className="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors relative z-10 cursor-pointer"
                                  aria-label={`Set delivery time for order ${order.orderNumber}`}
                                >
                                  Set Delivery
                                </button>
                              </>
                            )}
                            {order.status === 'in_production' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMarkReadyForDispatch(order, e);
                                  }}
                                  disabled={updatingOrders.has(order.id)}
                                  className={`px-3 py-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors relative z-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                    updatingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                  aria-label={`Mark order ${order.orderNumber} as ready for dispatch`}
                                >
                                  {updatingOrders.has(order.id) ? 'Updating...' : 'Ready'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    handleSetDeliveryTime(order); 
                                  }}
                                  className="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors relative z-10 cursor-pointer"
                                  aria-label={`Update delivery time for order ${order.orderNumber}`}
                                >
                                  Update
                                </button>
                              </>
                            )}
                            {order.status === 'ready_for_dispatch' && (
                              <button
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation(); 
                                  handleDispatchOrder(order); 
                                }}
                                className="px-3 py-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-md transition-colors relative z-10 cursor-pointer"
                                aria-label={`Dispatch order ${order.orderNumber}`}
                              >
                                Dispatch
                              </button>
                            )}
                            {order.status === 'dispatched' && (
                              <button
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation(); 
                                  handleMarkDelivered(order); 
                                }}
                                disabled={updatingOrders.has(order.id)}
                                className={`px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors relative z-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                  updatingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                aria-label={`Mark order ${order.orderNumber} as delivered`}
                              >
                                {updatingOrders.has(order.id) ? 'Updating...' : 'Mark Delivered'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm text-gray-500">Orders will appear here once customers place them.</p>
          </div>
        )}
      </div>

      {/* Delivery Time Modal */}
      {showDeliveryModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeliveryModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delivery-modal-title"
        >
          <div 
            ref={deliveryModalRef}
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="mt-3">
              <h3 id="delivery-modal-title" className="text-lg font-medium text-gray-900 mb-4">
                  Set Delivery Time - {selectedOrder?.orderNumber}
                </h3>
                <div className="mb-4">
                <label htmlFor="delivery-time-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date *
                  </label>
                  <input
                  id="delivery-time-input"
                    type="datetime-local"
                    value={deliveryTime}
                    onChange={(e) => {
                      const enteredValue = e.target.value;
                      if (enteredValue) {
                        const validation = validateDeliveryDate(enteredValue);
                        if (!validation.valid) {
                          toast.error(validation.message);
                          // Reset to empty or keep previous valid value
                          setDeliveryTime('');
                          e.target.value = '';
                          return;
                        }
                      }
                      setDeliveryTime(enteredValue);
                    }}
                    onBlur={(e) => {
                      // Validate on blur as well to catch manual entries
                      if (e.target.value) {
                        const validation = validateDeliveryDate(e.target.value);
                        if (!validation.valid) {
                          toast.error(validation.message);
                          setDeliveryTime('');
                          e.target.value = '';
                        }
                      }
                    }}
                    onPaste={(e) => {
                      // Prevent paste and validate after paste
                      e.preventDefault();
                      const pastedValue = e.clipboardData.getData('text');
                      if (pastedValue) {
                        const validation = validateDeliveryDate(pastedValue);
                        if (!validation.valid) {
                          toast.error(validation.message);
                          return;
                        }
                        setDeliveryTime(pastedValue);
                        e.target.value = pastedValue;
                      }
                    }}
                    onKeyDown={(e) => {
                      // Allow navigation and deletion keys
                      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                      if (allowedKeys.includes(e.key)) {
                        return;
                      }
                      // For manual typing, we'll validate on change
                    }}
                    min={getMinDateTime()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  disabled={submitting}
                  aria-required="true"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setDeliveryTime('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  disabled={submitting}
                  aria-label="Cancel setting delivery time"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDeliveryTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  disabled={submitting}
                  aria-label="Set delivery time"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting...
                    </>
                  ) : (
                    'Set Delivery Time'
                  )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Modal */}
        {showDispatchModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDispatchModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispatch-modal-title"
        >
          <div 
            ref={dispatchModalRef}
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="mt-3">
              <h3 id="dispatch-modal-title" className="text-lg font-medium text-gray-900 mb-4">
                  Dispatch Order - {selectedOrder?.orderNumber}
                </h3>
                <div className="space-y-4">
                  <div>
                  <label htmlFor="courier-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Courier Name *
                    </label>
                    <input
                    id="courier-input"
                      type="text"
                      value={dispatchData.courier}
                      onChange={(e) => setDispatchData({...dispatchData, courier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., FedEx, UPS, DHL"
                      required
                    disabled={submitting}
                    aria-required="true"
                    />
                  </div>
                  <div>
                  <label htmlFor="tracking-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number *
                    </label>
                    <input
                    id="tracking-input"
                      type="text"
                      value={dispatchData.trackingNumber}
                      onChange={(e) => setDispatchData({...dispatchData, trackingNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1Z999AA1234567890"
                      required
                    disabled={submitting}
                    aria-required="true"
                    />
                  </div>
                  <div>
                  <label htmlFor="dispatch-delivery-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery Date
                    </label>
                    <input
                    id="dispatch-delivery-input"
                      type="datetime-local"
                      value={dispatchData.estimatedDelivery}
                      onChange={(e) => {
                        const enteredValue = e.target.value;
                        if (enteredValue) {
                          const validation = validateDeliveryDate(enteredValue);
                          if (!validation.valid) {
                            toast.error(validation.message);
                            // Reset to empty or keep previous valid value
                            setDispatchData({...dispatchData, estimatedDelivery: ''});
                            e.target.value = '';
                            return;
                          }
                        }
                        setDispatchData({...dispatchData, estimatedDelivery: enteredValue});
                      }}
                      onBlur={(e) => {
                        // Validate on blur as well to catch manual entries
                        if (e.target.value) {
                          const validation = validateDeliveryDate(e.target.value);
                          if (!validation.valid) {
                            toast.error(validation.message);
                            setDispatchData({...dispatchData, estimatedDelivery: ''});
                            e.target.value = '';
                          }
                        }
                      }}
                      onPaste={(e) => {
                        // Prevent paste and validate after paste
                        e.preventDefault();
                        const pastedValue = e.clipboardData.getData('text');
                        if (pastedValue) {
                          const validation = validateDeliveryDate(pastedValue);
                          if (!validation.valid) {
                            toast.error(validation.message);
                            return;
                          }
                          setDispatchData({...dispatchData, estimatedDelivery: pastedValue});
                          e.target.value = pastedValue;
                        }
                      }}
                      onKeyDown={(e) => {
                        // Allow navigation and deletion keys
                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                        if (allowedKeys.includes(e.key)) {
                          return;
                        }
                        // For manual typing, we'll validate on change
                      }}
                      min={getMinDateTime()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                  onClick={() => {
                    setShowDispatchModal(false);
                    setDispatchData({ courier: '', trackingNumber: '', estimatedDelivery: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  disabled={submitting}
                  aria-label="Cancel dispatch"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDispatch}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                  disabled={submitting}
                  aria-label="Dispatch order"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Dispatching...
                    </>
                  ) : (
                    'Dispatch Order'
                  )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default OrderManagement;
