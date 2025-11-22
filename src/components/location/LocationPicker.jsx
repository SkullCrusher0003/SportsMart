import React, { useState, useContext } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { LocationContext } from '../../context/location/LocationContext';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

// Default center - Hyderabad city center
const defaultCenter = {
  lat: 17.385044,
  lng: 78.486671
};

// Predefined city centers for quick selection
const cityCenters = {
  hyderabad: { lat: 17.385044, lng: 78.486671, name: 'Hyderabad' },
  mumbai: { lat: 19.076090, lng: 72.877426, name: 'Mumbai' },
  delhi: { lat: 28.613939, lng: 77.209023, name: 'Delhi' },
  bangalore: { lat: 12.971599, lng: 77.594566, name: 'Bangalore' },
  chennai: { lat: 13.082680, lng: 80.270721, name: 'Chennai' },
  kolkata: { lat: 22.572645, lng: 88.363892, name: 'Kolkata' },
  pune: { lat: 18.520430, lng: 73.856743, name: 'Pune' },
  ahmedabad: { lat: 23.022505, lng: 72.571365, name: 'Ahmedabad' },
};

function LocationPicker({ onLocationSelect }) {
  const { getCurrentLocation, isLoadingLocation } = useContext(LocationContext);
  const { isLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [address, setAddress] = useState('');
  const [searchInput, setSearchInput] = useState('');

  if (loadError) return <div className="text-red-500 p-4">Error loading maps. Please check your API key.</div>;
  if (!isLoaded) return <div className="p-4">Loading maps...</div>;

  // Unified function to update location and trigger callback
  const updateLocation = (location, addressText) => {
    setSelectedLocation(location);
    setAddress(addressText);
    setSearchInput(addressText);
    map?.panTo(location);
    
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
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateLocation(location, results[0].formatted_address);
      } else {
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
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          updateLocation(location, results[0].formatted_address);
        } else {
          updateLocation(location, `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        }
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please select manually.');
    }
  };

  // Handle city selection from dropdown
  const handleCitySelect = (e) => {
    const cityKey = e.target.value;
    if (cityKey && cityCenters[cityKey]) {
      const city = cityCenters[cityKey];
      const location = { lat: city.lat, lng: city.lng };
      
      // Reverse geocode to get proper address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          updateLocation(location, results[0].formatted_address);
        } else {
          updateLocation(location, `${city.name}, India`);
        }
      });
      
      map?.setZoom(12);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Location
        </label>
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Type address, area, or landmark..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </Autocomplete>
      </div>

      {/* Quick Options Row */}
      <div className="flex flex-wrap gap-2">
        {/* City Dropdown */}
        <select
          onChange={handleCitySelect}
          className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          defaultValue=""
        >
          <option value="" disabled>Select City</option>
          {Object.entries(cityCenters).map(([key, city]) => (
            <option key={key} value={key}>{city.name}</option>
          ))}
        </select>

        {/* Current Location Button */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition-colors text-sm"
        >
          {isLoadingLocation ? '📍 Getting...' : '📍 Use My Location'}
        </button>
      </div>

      {/* Map */}
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

      {/* Selected Location Display */}
      {address && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">✓ Selected Location:</p>
          <p className="text-sm text-gray-700">{address}</p>
        </div>
      )}

      {/* Helper Text */}
      {!address && (
        <p className="text-xs text-gray-500 text-center">
          Search for a location, select a city, use your current location, or click on the map
        </p>
      )}
    </div>
  );
}

export default LocationPicker;
