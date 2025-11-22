import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { doc, onSnapshot } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px'
};

function OrderTracking({ orderId }) {
  const { isLoaded } = useGoogleMaps();
  const [order, setOrder] = useState(null);
  const [directions, setDirections] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    // Real-time order tracking
    const orderRef = doc(fireDB, 'orders', orderId);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const orderData = { id: doc.id, ...doc.data() };
        setOrder(orderData);
        
        // Update delivery person location if available
        if (orderData.deliveryPersonLocation) {
          setDeliveryLocation(orderData.deliveryPersonLocation);
        }
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    if (order && deliveryLocation && order.deliveryAddress?.location && isLoaded) {
      calculateRoute();
    }
  }, [deliveryLocation, order, isLoaded]);

  const calculateRoute = () => {
    if (!window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: deliveryLocation,
        destination: order.deliveryAddress.location,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          
          // Get estimated time
          const duration = result.routes[0].legs[0].duration.text;
          setEstimatedTime(duration);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'out_for_delivery':
        return '🚚';
      case 'delivered':
        return '📦';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!order) return <div>Loading order details...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Order #{order.id.slice(-8)}</h2>
          <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)} {order.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((status, index) => (
              <div key={status} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {getStatusIcon(status)}
                </div>
                <p className="text-xs mt-2 text-center">{status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ 
                width: `${(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) / 4) * 100}%` 
              }}
            />
          </div>
        </div>

        {estimatedTime && order.status === 'out_for_delivery' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">
              🕐 Estimated delivery time: {estimatedTime}
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      {order.deliveryAddress?.location && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Live Tracking</h3>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={deliveryLocation || order.deliveryAddress.location}
          >
            {/* Delivery address marker */}
            <Marker
              position={order.deliveryAddress.location}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
              }}
              label="Delivery"
            />

            {/* Delivery person location marker */}
            {deliveryLocation && order.status === 'out_for_delivery' && (
              <Marker
                position={deliveryLocation}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
                label="Delivery Person"
              />
            )}

            {/* Route */}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Delivery Address: {order.deliveryAddress?.address}</span>
            </div>
            {deliveryLocation && order.status === 'out_for_delivery' && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Delivery Person Location (Live)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">Order Details</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Order Date:</span> {new Date(order.date).toLocaleString()}</p>
          <p><span className="font-medium">Total Amount:</span> ₹{order.totalAmount}</p>
          <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
