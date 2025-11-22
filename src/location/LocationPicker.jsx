import React, { useState, useContext } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { LocationContext } from '../../context/location/LocationContext';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 17.385044,
  lng: 78.486671 // Hyderabad
};

function LocationPicker({ onLocationSelect }) {
  const { getCurrentLocation, isLoadingLocation } = useContext(LocationContext);
  const { isLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [address, setAddress] = useState('');

  if (loadError) return <div className="text-red-500 p-4">Error loading maps. Please check your API key.</div>;
  if (!isLoaded) return <div className="p-4">Loading maps...</div>;

  // Unified function to update location and trigger callback
  const updateLocation = (location, addressText) => {
    setSelectedLocation(location);
    setAddress(addressText);
    map?.panTo(location);
    
    // Always trigger the callback with location data
    if (onLocationSelect) {
      onLocationSelect({
        ...location,
        address: addressText
      });
    }
  };

  const onMapClick = (e) => {
    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateLocation(location, results[0].formatted_address);
      } else {
        // Fallback to coordinates if geocoding fails
        updateLocation(location, `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      }
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        updateLocation(location, place.formatted_address || place.name);
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          updateLocation(location, results[0].formatted_address);
        } else {
          // Fallback to coordinates if geocoding fails
          updateLocation(location, `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        }
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please select manually.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={onPlaceChanged}
          className="flex-1"
        >
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={address}
            key={address} // Force re-render when address changes
          />
        </Autocomplete>
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
        >
          {isLoadingLocation ? 'Getting...' : 'Use My Location'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={selectedLocation}
        onClick={onMapClick}
        onLoad={setMap}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker 
          position={selectedLocation}
          animation={window.google.maps.Animation.DROP}
        />
      </GoogleMap>

      {address && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Selected Location:</p>
          <p className="font-medium">{address}</p>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
