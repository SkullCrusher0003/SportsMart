// Utility functions for location-based features

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get address from coordinates using Google Geocoding API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Geocoding failed: ' + status));
        }
      });
    });
  } catch (error) {
    console.error('Error getting address:', error);
    throw error;
  }
};

/**
 * Get coordinates from address using Google Geocoding API
 * @param {string} address - Address string
 * @returns {Promise<{lat: number, lng: number}>} Coordinates
 */
export const getCoordinatesFromAddress = async (address) => {
  try {
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error('Geocoding failed: ' + status));
        }
      });
    });
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw error;
  }
};

/**
 * Check if a location is within delivery radius
 * @param {Object} userLocation - User's location {lat, lng}
 * @param {Object} shopLocation - Shop's location {lat, lng}
 * @param {number} deliveryRadius - Delivery radius in km
 * @returns {boolean} True if within radius
 */
export const isWithinDeliveryRadius = (userLocation, shopLocation, deliveryRadius) => {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    shopLocation.lat,
    shopLocation.lng
  );
  return distance <= deliveryRadius;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in km
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Calculate estimated delivery time based on distance
 * @param {number} distance - Distance in km
 * @param {string} vehicleType - Type of vehicle (bike, car, etc.)
 * @returns {string} Estimated time
 */
export const calculateEstimatedDeliveryTime = (distance, vehicleType = 'bike') => {
  // Average speeds in km/h
  const speeds = {
    bike: 25,
    scooter: 30,
    car: 40
  };
  
  const speed = speeds[vehicleType] || speeds.bike;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  // Add preparation time (15 minutes)
  const totalTime = timeInMinutes + 15;
  
  if (totalTime < 60) {
    return `${totalTime} minutes`;
  } else {
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  }
};

/**
 * Sort locations by distance from a reference point
 * @param {Array} locations - Array of location objects with lat, lng
 * @param {Object} referencePoint - Reference point {lat, lng}
 * @returns {Array} Sorted array with distances
 */
export const sortByDistance = (locations, referencePoint) => {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(
        referencePoint.lat,
        referencePoint.lng,
        location.lat,
        location.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Get current position as a promise
 * @returns {Promise<{lat: number, lng: number}>} Current position
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Check if geolocation is supported
 * @returns {boolean}
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Calculate delivery charges based on distance
 * @param {number} distance - Distance in km
 * @returns {number} Delivery charges
 */
export const calculateDeliveryCharges = (distance) => {
  const baseCharge = 20; // Base charge in rupees
  const perKmCharge = 5; // Per km charge
  
  if (distance <= 2) {
    return baseCharge;
  }
  
  return baseCharge + ((distance - 2) * perKmCharge);
};
